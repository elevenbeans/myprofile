#!/usr/bin/env node
/**
 * Generate crawlable city pages, the city archive, sitemap.xml and
 * the main page's JSON-LD block from the data embedded in earth-online/index.html.
 *
 * Usage:
 *   node earth-online/scripts/generate-seo-pages.mjs
 *   node earth-online/scripts/generate-seo-pages.mjs --check
 *
 * Set SEO_LASTMOD=YYYY-MM-DD to override the date written to sitemap/JSON-LD.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EARTH_DIR = path.resolve(HERE, '..');
const ROOT_DIR = path.resolve(EARTH_DIR, '..');
const INDEX_PATH = path.join(EARTH_DIR, 'index.html');
const CHECK = process.argv.includes('--check');
const LAST_MOD = process.env.SEO_LASTMOD || '2026-11-23';
const SITE = 'https://elevenbeans.me';
const EARTH_URL = `${SITE}/earth-online/`;
const ARCHIVE_URL = `${EARTH_URL}cities/`;
const CITY_BASE = `${EARTH_URL}city/`;
const OG_IMAGE = `${EARTH_URL}preview/home.webp`;
const OG_IMAGE_ALT = 'Earth Online 的 3D 地球、城市积分与实时天气';

const html = fs.readFileSync(INDEX_PATH, 'utf8');

function extract(name, open, close){
  const marker = `const ${name} = `;
  let i = html.indexOf(marker);
  if (i < 0) throw new Error(`Could not find ${name} in index.html`);
  i += marker.length;
  while (/\s/.test(html[i])) i++;
  if (html[i] !== open) throw new Error(`${name} does not start with ${open}`);
  const begin = i;
  let depth = 0;
  let quote = null;
  let esc = false;
  let lineComment = false;
  let blockComment = false;
  for (; i < html.length; i++){
    const c = html[i];
    const n = html[i + 1];
    if (lineComment){ if (c === '\n') lineComment = false; continue; }
    if (blockComment){ if (c === '*' && n === '/'){ blockComment = false; i++; } continue; }
    if (quote){
      if (esc){ esc = false; continue; }
      if (c === '\\'){ esc = true; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '/' && n === '/'){ lineComment = true; i++; continue; }
    if (c === '/' && n === '*'){ blockComment = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`'){ quote = c; continue; }
    if (c === open) depth++;
    else if (c === close){
      depth--;
      if (depth === 0) return vm.runInNewContext(`(${html.slice(begin, i + 1)})`, Object.create(null), { timeout: 3000 });
    }
  }
  throw new Error(`Unbalanced ${name}`);
}

const CITIES = extract('CITIES', '[', ']');
const EXTRA_CITIES = extract('EXTRA_CITIES', '[', ']');
const LANDMARKS = extract('LANDMARKS', '{', '}');
const CITY_MAPS = extract('CITY_MAPS', '{', '}');
const LANDMARK_BLUEPRINT = extract('LANDMARK_BLUEPRINT', '{', '}');
const { CITY_DOSSIERS } = await import(pathToUrl(path.join(EARTH_DIR, 'data/city-dossiers.js')));
const { CITY_PAGE_URLS } = await import(pathToUrl(path.join(EARTH_DIR, 'data/city-pages.js')));

function pathToUrl(p){ return new URL(`file://${path.resolve(p)}`).href; }

const ALL = [...CITIES, ...EXTRA_CITIES];

function esc(value){
  return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function jsonForHtml(obj){
  return JSON.stringify(obj, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function fmtCoord(lat, lon, digits = 4){
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(digits)}°${ns} · ${Math.abs(lon).toFixed(digits)}°${ew}`;
}

function fmtDistance(km){
  return `${Math.round(km).toLocaleString('en-US')} km`;
}

function distanceKm(a, b){
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180;
  const la2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function cityUrl(id){ return `${CITY_BASE}${encodeURIComponent(id)}/`; }
function appCityUrl(id, detail = true){ return `${EARTH_URL}#/city/${encodeURIComponent(id)}${detail ? '/detail' : ''}`; }

function landmarkOf(city){ return LANDMARKS[city.id] || {}; }
function mapOf(city){ return CITY_MAPS[city.id] || {}; }
function dossierOf(city){ return CITY_DOSSIERS[city.id] || {}; }

function heightOf(city){
  const map = mapOf(city);
  const lm = landmarkOf(city);
  const bp = LANDMARK_BLUEPRINT[lm.type];
  return Number(map.height) || Number(bp && bp.alt) || 0;
}

function heightText(city){
  const h = heightOf(city);
  return h ? `${h.toLocaleString('en-US')} m` : '街区 / 地景';
}

function yearText(city){
  const year = dossierOf(city).year;
  return year == null || year === '' ? '—' : String(year);
}

function architectText(city){
  return dossierOf(city).architect || '—';
}

function landmarkType(city){
  return heightOf(city) ? '建筑地标' : '街区 / 地景';
}

function factZh(city){
  return (dossierOf(city).fact && dossierOf(city).fact.zh) || '';
}
function factEn(city){
  return (dossierOf(city).fact && dossierOf(city).fact.en) || '';
}

function labelOf(city){
  const map = mapOf(city);
  return map.label || landmarkOf(city).name || city.name;
}

function summaryZh(city){
  const label = labelOf(city);
  const map = mapOf(city);
  const lines = `${map.height ? '天际线' : '街区轮廓'}`;
  return `${city.name.zh}（${city.name.en}）位于${city.country.zh}，城市坐标 ${fmtCoord(city.lat, city.lon)}，使用 ${city.tz} 时区。` +
    `Earth Online 把镜头放在${label.zh}，用 OpenStreetMap 建筑体量与 3D 地标重建这一带的${lines}。` +
    factZh(city);
}

function summaryEn(city){
  const label = labelOf(city);
  return `${city.name.en} is a city in ${city.country.en} at ${fmtCoord(city.lat, city.lon)} (${city.tz}). ` +
    `Earth Online frames ${label.en} with OpenStreetMap massing and a 3D landmark. ` +
    factEn(city);
}

function metaDescription(city){
  const lm = landmarkOf(city);
  const label = labelOf(city);
  const subject = label.zh.includes(lm.name.zh) ? label.zh : `${lm.name.zh}与${label.zh}`;
  return `${city.name.zh}（${city.name.en}）3D 城市地图：查看${subject}的 OSM 建筑体量、实时天气、当地时间与城市积分。`;
}

function metaDescriptionEn(city){
  const lm = landmarkOf(city);
  return `Explore ${city.name.en} in 3D: ${lm.name.en}, OpenStreetMap buildings, live weather, local time and the shared city score.`;
}

function pageTitle(city){
  const lm = landmarkOf(city);
  return `${city.name.zh} 3D 地图与实时天气 · ${lm.name.zh} | Earth Online`;
}

function nearby(city){
  return CITIES
    .filter((c) => c.id !== city.id)
    .map((c) => ({ city: c, km: distanceKm(city, c) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 4);
}

function utmCityPage(raw, id){
  if (!raw) return '';
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:') return '';
    u.searchParams.set('utm_source', 'earth-online');
    u.searchParams.set('utm_medium', 'referral');
    u.searchParams.set('utm_campaign', 'city-page');
    u.searchParams.set('utm_content', id);
    return u.href;
  } catch { return ''; }
}

function osmUrl(city){
  const map = mapOf(city);
  const [lng, lat] = map.center || [city.lon, city.lat];
  const zoom = Math.max(4, Math.min(17, Math.round(Number(map.zoom) || 13)));
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
}

function breadcrumbHtml(city){
  return `<nav class="breadcrumb" aria-label="面包屑">
  <a href="${SITE}/">首页</a><span aria-hidden="true">/</span>
  <a href="${EARTH_URL}">Earth Online</a><span aria-hidden="true">/</span>
  <a href="${ARCHIVE_URL}">城市档案</a><span aria-hidden="true">/</span>
  <span aria-current="page">${esc(city.name.zh)}</span>
</nav>`;
}

function headBlock({ title, description, canonical, ogType, jsonLd, cssHref }){
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="Elevenbeans">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<meta name="theme-color" content="#04060b">
<link rel="canonical" href="${esc(canonical)}">
<link rel="icon" href="https://images.elevenbeans.me/elevenbeans.ico">
<link rel="stylesheet" href="${esc(cssHref)}">
<meta property="og:site_name" content="Earth Online · mini">
<meta property="og:locale" content="zh_CN">
<meta property="og:locale:alternate" content="en_US">
<meta property="og:type" content="${esc(ogType)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:alt" content="${OG_IMAGE_ALT}">
<meta property="og:image:width" content="1600">
<meta property="og:image:height" content="1000">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${OG_IMAGE}">
<meta name="twitter:image:alt" content="${OG_IMAGE_ALT}">
<script type="application/ld+json">
${jsonForHtml(jsonLd)}
</script>
</head>`;
}

function siteHeader(){
  return `<header class="top">
  <a class="brand" href="${EARTH_URL}" aria-label="Earth Online · mini">
    <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true">
      <circle cx="14" cy="14" r="11.2"/>
      <ellipse cx="14" cy="14" rx="5.2" ry="11.2"/>
      <path d="M3.2 10.1h21.6M3.2 17.9h21.6"/>
      <circle cx="14" cy="14" r="2.1" fill="currentColor" stroke="none" opacity=".8"/>
    </svg>
    <span>Earth Online <em>mini</em></span>
  </a>
  <nav aria-label="站点导航">
    <a href="${EARTH_URL}">3D 地球</a>
    <a href="${ARCHIVE_URL}">城市档案</a>
    <a href="${SITE}/">elevenbeans.me</a>
  </nav>
</header>`;
}

function siteFooter(){
  return `<footer class="foot">
  <p><a href="${EARTH_URL}">Earth Online · mini</a> — 46 座城市的实时地球</p>
  <p><a href="${ARCHIVE_URL}">全部城市档案</a> · <a href="${SITE}/">elevenbeans.me</a></p>
</footer>`;
}

function cityJsonLd(city){
  const lm = landmarkOf(city);
  const map = mapOf(city);
  const center = map.origin || [city.lon, city.lat];
  const page = cityUrl(city.id);
  const cityId = `${page}#city`;
  const landmarkId = `${page}#landmark`;
  const breadcrumbId = `${page}#breadcrumb`;
  const webpageId = `${page}#webpage`;
  const h = heightOf(city);
  const neighborhood = map.label || lm.name || city.name;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': webpageId,
        url: page,
        name: pageTitle(city),
        description: metaDescription(city),
        isPartOf: { '@id': `${EARTH_URL}#webpage` },
        inLanguage: 'zh-CN',
        dateModified: LAST_MOD,
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: OG_IMAGE,
          width: 1600,
          height: 1000
        },
        about: { '@id': cityId },
        mainEntity: { '@id': cityId },
        breadcrumb: { '@id': breadcrumbId }
      },
      {
        '@type': 'City',
        '@id': cityId,
        name: city.name.zh,
        alternateName: city.name.en,
        url: page,
        description: summaryZh(city),
        containedInPlace: { '@type': 'Country', name: city.country.zh, alternateName: city.country.en },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: city.lat,
          longitude: city.lon
        }
      },
      {
        '@type': 'TouristAttraction',
        '@id': landmarkId,
        name: lm.name.zh,
        alternateName: lm.name.en,
        description: `${lm.name.zh}（${lm.name.en}），${h ? `高 ${h.toLocaleString('en-US')} 米` : '城市街区地标'}。${factZh(city)}`,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: Number(center[1]),
          longitude: Number(center[0])
        },
        containedInPlace: { '@id': cityId },
        address: {
          '@type': 'PostalAddress',
          addressLocality: city.name.zh,
          addressCountry: city.country.en
        }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': breadcrumbId,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Earth Online', item: EARTH_URL },
          { '@type': 'ListItem', position: 3, name: '城市档案', item: ARCHIVE_URL },
          { '@type': 'ListItem', position: 4, name: city.name.zh, item: page }
        ]
      }
    ]
  };
}

function cityPage(city){
  const lm = landmarkOf(city);
  const map = mapOf(city);
  const dossier = dossierOf(city);
  const page = cityUrl(city.id);
  const index = ALL.findIndex((c) => c.id === city.id) + 1;
  const center = map.center || [city.lon, city.lat];
  const origin = map.origin || center;
  const points = Array.isArray(map.points) ? map.points : [];
  const roads = Array.isArray(map.roads) ? map.roads : [];
  const h = heightOf(city);
  const cityPageHref = utmCityPage(CITY_PAGE_URLS[city.id], city.id);
  const near = nearby(city);

  const poiHtml = points.length
    ? points.map((p, i) => `<li class="${p.major ? 'is-major' : ''}">
        <span>${String(i + 1).padStart(2, '0')}</span>
        <strong>${esc(p.name.zh)}</strong>
        <em>${p.height ? `${Number(p.height).toLocaleString('en-US')} m` : (p.major ? '主地标' : '—')}</em>
      </li>`).join('')
    : `<li class="is-major"><span>01</span><strong>${esc(lm.name.zh)}</strong><em>${h ? `${h.toLocaleString('en-US')} m` : '主地标'}</em></li>`;

  const roadsHtml = roads.length
    ? roads.map((r) => `<li><strong>${esc(r.zh)}</strong><span>${esc(r.en)}</span></li>`).join('')
    : '<li><strong>城市中心</strong><span>City center</span></li>';

  const nearHtml = near.map(({ city: c, km }) => `<a href="${cityUrl(c.id)}">
      <strong>${esc(c.name.zh)}</strong>
      <span>${esc(c.name.en)}</span>
      <em>${fmtDistance(km)}</em>
    </a>`).join('');

  const externalLinks = [];
  if (cityPageHref) externalLinks.push(`<a class="btn btn--ghost" href="${esc(cityPageHref)}" target="_blank" rel="noopener noreferrer">城市机票页 <span aria-hidden="true">↗</span></a>`);
  externalLinks.push(`<a class="btn btn--ghost" href="${osmUrl(city)}" target="_blank" rel="noopener noreferrer">OpenStreetMap <span aria-hidden="true">↗</span></a>`);

  return `<!DOCTYPE html>
<html lang="zh-CN">
${headBlock({
    title: pageTitle(city),
    description: metaDescription(city),
    canonical: page,
    ogType: 'article',
    jsonLd: cityJsonLd(city),
    cssHref: '../../city-pages.css'
  })}
<body>
<a class="skip" href="#main">跳到正文</a>
${siteHeader()}
<main id="main">
${breadcrumbHtml(city)}

<section class="hero">
  <p class="eyebrow">ORBITAL BLUEPRINT · CITY FILE <span>${String(index).padStart(2, '0')} / ${ALL.length}</span></p>
  <h1>${esc(city.name.zh)} <span>${esc(city.name.en)}</span></h1>
  <p class="coords">${esc(city.country.zh)} · ${fmtCoord(city.lat, city.lon)} · ${esc(city.tz)}</p>
  <p class="lede">${esc(summaryZh(city))}</p>
  <div class="actions">
    <a class="btn" href="${appCityUrl(city.id, true)}">打开${esc(city.name.zh)} 3D 城市视图 <span aria-hidden="true">→</span></a>
    <a class="btn btn--ghost" href="${appCityUrl(city.id, false)}">查看实时天气</a>
    ${externalLinks.join('\n    ')}
  </div>
</section>

<div class="grid">
  <section class="card">
    <p class="kicker">LANDMARK / 地标</p>
    <h2 class="landmark-name">${esc(lm.name.zh)} <span>${esc(lm.name.en)}</span></h2>
    <dl class="stats">
      <div><dt>高度</dt><dd>${esc(heightText(city))}</dd></div>
      <div><dt>年代 / 竣工</dt><dd>${esc(yearText(city))}</dd></div>
      <div><dt>设计 / 建造</dt><dd>${esc(architectText(city))}</dd></div>
      <div><dt>类型</dt><dd>${esc(landmarkType(city))}</dd></div>
    </dl>
    <p class="fact">${esc(factZh(city))}</p>
  </section>

  <section class="card">
    <p class="kicker">CAMERA / 3D 视角</p>
    <h2>镜头落在${esc((map.label || lm.name).zh)}</h2>
    <dl class="stats stats--two">
      <div><dt>镜头中心</dt><dd>${fmtCoord(Number(center[1]), Number(center[0]))}</dd></div>
      <div><dt>默认缩放</dt><dd>${esc(map.zoom || '—')}</dd></div>
      <div><dt>俯仰 / 朝向</dt><dd>${esc(map.pitch || 0)}° / ${esc(map.bearing || 0)}°</dd></div>
      <div><dt>地图数据</dt><dd>OSM · Esri</dd></div>
    </dl>
    <p class="fact">建筑体量来自 OpenStreetMap，经 OpenFreeMap 矢量瓦片挤出；Esri 灰度底图作为无 Key 的回退。镜头中心位于 ${fmtCoord(Number(origin[1]), Number(origin[0]))}。</p>
  </section>
</div>

<section class="sec">
  <h2><span>01</span>地图上可以找到</h2>
  <ul class="poi">${poiHtml}</ul>
</section>

<section class="sec">
  <h2><span>02</span>街道与方位</h2>
  <ul class="roads">${roadsHtml}</ul>
</section>

<section class="sec">
  <h2><span>03</span>实时天气与当地时间</h2>
  <div class="card card--weather">
    <p>打开 Earth Online 的 3D 地球后，可以读取${esc(city.name.zh)}的当前温度、体感、湿度、风速、日出日落、空气质量与未来三天预报；城市时间按 <code>${esc(city.tz)}</code> 时区显示。</p>
    <div class="actions">
      <a class="btn" href="${appCityUrl(city.id, false)}">查看${esc(city.name.zh)}实时天气 <span aria-hidden="true">→</span></a>
      <a class="btn btn--ghost" href="${EARTH_URL}">返回 3D 地球</a>
    </div>
  </div>
</section>

<section class="sec" lang="en">
  <h2><span>04</span>About ${esc(city.name.en)}</h2>
  <div class="card">
    <p>${esc(summaryEn(city))}</p>
    <p class="fact">${esc(factEn(city))}</p>
  </div>
</section>

<section class="sec">
  <h2><span>05</span>继续探索</h2>
  <div class="near">${nearHtml}</div>
</section>

<p class="note">地图数据 © OpenStreetMap contributors，矢量瓦片由 OpenFreeMap 提供；底图 © Esri。地标高度、年份与建筑师信息来自 Earth Online 城市配置，仅用于 3D 示意与城市档案。最后更新：<time datetime="${LAST_MOD}">${LAST_MOD}</time>。</p>
</main>
${siteFooter()}
</body>
</html>`;
}

function archiveJsonLd(){
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${ARCHIVE_URL}#webpage`,
        url: ARCHIVE_URL,
        name: '城市档案 · 46 座城市的 3D 地标与实时天气 | Earth Online',
        description: 'Earth Online 城市档案：46 座首页城市与 3 座详情页城市，包含地标、坐标、OSM 3D 地图、实时天气与当地时间。',
        isPartOf: { '@id': `${EARTH_URL}#webpage` },
        inLanguage: 'zh-CN',
        dateModified: LAST_MOD,
        primaryImageOfPage: { '@type': 'ImageObject', url: OG_IMAGE, width: 1600, height: 1000 },
        mainEntity: { '@id': `${ARCHIVE_URL}#list` },
        breadcrumb: { '@id': `${ARCHIVE_URL}#breadcrumb` }
      },
      {
        '@type': 'ItemList',
        '@id': `${ARCHIVE_URL}#list`,
        name: 'Earth Online 城市档案',
        numberOfItems: ALL.length,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: ALL.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${c.name.zh} ${c.name.en}`,
          url: cityUrl(c.id)
        }))
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${ARCHIVE_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Earth Online', item: EARTH_URL },
          { '@type': 'ListItem', position: 3, name: '城市档案', item: ARCHIVE_URL }
        ]
      }
    ]
  };
}

function archivePage(){
  const groups = [];
  for (const city of ALL){
    let group = groups.find((g) => g.zh === city.country.zh);
    if (!group){
      group = { zh: city.country.zh, en: city.country.en, cities: [] };
      groups.push(group);
    }
    group.cities.push(city);
  }
  const groupHtml = groups.map((g) => `<section class="country">
    <h2>${esc(g.zh)} <span>${esc(g.en)}</span><em>${g.cities.length}</em></h2>
    <div class="city-grid">
      ${g.cities.map((c) => {
        const lm = landmarkOf(c);
        return `<a class="city-card" href="${cityUrl(c.id)}">
          <strong>${esc(c.name.zh)}</strong>
          <span>${esc(c.name.en)}</span>
          <em>${esc(lm.name.zh)}</em>
        </a>`;
      }).join('')}
    </div>
  </section>`).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
${headBlock({
    title: '城市档案 · 46 座城市的 3D 地标与实时天气 | Earth Online',
    description: '浏览 Earth Online 的 46 座首页城市与 3 座详情页城市：每座城市都有地标、坐标、OSM 3D 地图、实时天气与当地时间。',
    canonical: ARCHIVE_URL,
    ogType: 'website',
    jsonLd: archiveJsonLd(),
    cssHref: '../city-pages.css'
  })}
<body>
<a class="skip" href="#main">跳到正文</a>
${siteHeader()}
<main id="main">
<nav class="breadcrumb" aria-label="面包屑">
  <a href="${SITE}/">首页</a><span aria-hidden="true">/</span>
  <a href="${EARTH_URL}">Earth Online</a><span aria-hidden="true">/</span>
  <span aria-current="page">城市档案</span>
</nav>
<section class="hero">
  <p class="eyebrow">ORBITAL BLUEPRINT · CITY ARCHIVE</p>
  <h1>城市档案 <span>City Archive</span></h1>
  <p class="lede">46 座首页城市，加上 3 座只通过详情页访问的城市。每一页都记录地标、坐标、3D 地图里的街区与街道，以及如何打开实时天气和当地时间。</p>
  <div class="actions">
    <a class="btn" href="${EARTH_URL}">打开 3D 地球 <span aria-hidden="true">→</span></a>
    <a class="btn btn--ghost" href="${SITE}/">elevenbeans.me</a>
  </div>
</section>
<div class="archive-stats">
  <div><b>${CITIES.length}</b><span>首页城市</span></div>
  <div><b>${EXTRA_CITIES.length}</b><span>详情页城市</span></div>
  <div><b>${ALL.length}</b><span>城市档案</span></div>
  <div><b>${ALL.filter((c) => heightOf(c) > 0).length}</b><span>建筑地标</span></div>
</div>
${groupHtml}
<p class="note">地标高度、年份与建筑师信息来自 Earth Online 城市配置；地图数据 © OpenStreetMap contributors，矢量瓦片由 OpenFreeMap 提供，底图 © Esri。最后更新：<time datetime="${LAST_MOD}">${LAST_MOD}</time>。</p>
</main>
${siteFooter()}
</body>
</html>`;
}

function mainJsonLd(){
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: `${SITE}/`,
        name: 'elevenbeans',
        inLanguage: ['zh-CN', 'en'],
        publisher: { '@type': 'Person', name: 'Elevenbeans', url: `${SITE}/` }
      },
      {
        '@type': 'WebPage',
        '@id': `${EARTH_URL}#webpage`,
        url: EARTH_URL,
        name: 'Earth Online · mini — 3D 地球、46 城实时天气与城市地图',
        description: 'Earth Online · mini 是一个可交互的 3D 地球：覆盖北京、上海、东京、巴黎、纽约等 46 座城市，查看实时天气、共享城市积分、OSM 3D 地标与 Orbital Blueprint 城市明信片。',
        isPartOf: { '@id': `${SITE}/#website` },
        inLanguage: 'zh-CN',
        dateModified: LAST_MOD,
        primaryImageOfPage: { '@type': 'ImageObject', url: OG_IMAGE, width: 1600, height: 1000 },
        breadcrumb: { '@id': `${EARTH_URL}#breadcrumb` },
        mainEntity: { '@id': `${EARTH_URL}#app` }
      },
      {
        '@type': 'WebApplication',
        '@id': `${EARTH_URL}#app`,
        name: 'Earth Online · mini',
        url: EARTH_URL,
        description: 'A real-time 3D Earth with 46 cities, live weather, shared scores, a local passport with landmark scans, daily routes and Orbital Blueprint city maps.',
        applicationCategory: 'TravelApplication',
        applicationSubCategory: '3D city maps',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript and WebGL',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        screenshot: OG_IMAGE,
        featureList: [
          'Interactive 3D Earth',
          '46 cities with live weather',
          'OSM 3D landmark maps',
          'Shared city score',
          'Orbital Passport with landmark scans',
          'Daily route',
          'City postcards'
        ],
        author: { '@type': 'Person', name: 'Elevenbeans', url: `${SITE}/` },
        isPartOf: { '@id': `${EARTH_URL}#webpage` }
      },
      {
        '@type': 'ItemList',
        '@id': `${EARTH_URL}#cities`,
        name: 'Earth Online 首页城市',
        numberOfItems: CITIES.length,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: CITIES.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${c.name.zh} ${c.name.en}`,
          url: cityUrl(c.id)
        }))
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${EARTH_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Earth Online', item: EARTH_URL }
        ]
      }
    ]
  };
}

function sitemap(){
  const urls = [
    { loc: `${SITE}/`, priority: '1.0' },
    { loc: EARTH_URL, priority: '0.9' },
    { loc: ARCHIVE_URL, priority: '0.8' },
    ...ALL.map((c) => ({ loc: cityUrl(c.id), priority: '0.7' }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
}

function replaceMainJsonLd(source, block){
  const start = '<!-- seo:jsonld:start -->';
  const end = '<!-- seo:jsonld:end -->';
  const a = source.indexOf(start);
  const b = source.indexOf(end);
  if (a < 0 || b < 0 || b < a) throw new Error('Missing seo:jsonld markers in index.html');
  return source.slice(0, a + start.length) + '\n' + block + '\n' + source.slice(b);
}

const outputs = new Map();
outputs.set(path.join(ROOT_DIR, 'sitemap.xml'), sitemap());
outputs.set(path.join(EARTH_DIR, 'cities', 'index.html'), archivePage());
for (const city of ALL){
  outputs.set(path.join(EARTH_DIR, 'city', city.id, 'index.html'), cityPage(city));
}

const mainBlock = `<script type="application/ld+json">\n${jsonForHtml(mainJsonLd())}\n</script>`;
const nextIndex = replaceMainJsonLd(html, mainBlock);
outputs.set(INDEX_PATH, nextIndex);

const mismatches = [];
for (const [file, content] of outputs){
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (current !== content) mismatches.push(file);
}

if (CHECK){
  if (mismatches.length){
    console.error(`SEO output is stale (${mismatches.length} file${mismatches.length === 1 ? '' : 's'}):`);
    for (const file of mismatches) console.error(`  - ${path.relative(ROOT_DIR, file)}`);
    console.error('Run: npm run seo:generate');
    process.exit(1);
  }
  console.log(`SEO output is up to date: ${outputs.size} files checked.`);
  process.exit(0);
}

for (const [file, content] of outputs){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
console.log(`Generated ${ALL.length} city pages + archive + sitemap (${outputs.size} files).`);
console.log(`Updated main JSON-LD: ${path.relative(ROOT_DIR, INDEX_PATH)}`);
