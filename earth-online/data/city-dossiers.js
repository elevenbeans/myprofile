// Lightweight city dossiers for the Orbital Archive.
// Heights come from the city-map config; these entries add only the facts that
// cannot be derived from the map. Dates are completion/opening years, not
// construction start dates, unless a range is shown.
export const CITY_DOSSIERS = {
  beijing: {
    year: 2018,
    architect: 'Kohn Pedersen Fox (KPF)',
    fact: {
      zh: '528 米的中国尊以收分轮廓成为国贸天际线的核心，塔冠在夜里像一枚发光的坐标。',
      en: 'The 528 m CITIC Tower tapers into a crown that anchors the Guomao skyline.'
    }
  },
  shanghai: {
    year: 2015,
    architect: 'Gensler',
    fact: {
      zh: '632 米的螺旋塔身把九座竖向中庭叠在一起，外立面像一层旋转的玻璃表皮。',
      en: 'Its 632 m spiral stacks nine vertical atriums beneath a twisting glass skin.'
    }
  },
  chengdu: {
    year: 2014,
    architect: null,
    fact: {
      zh: '双塔与 IFS 商业体量共同围合春熙路，塔冠在夜里形成一组清晰的双子坐标。',
      en: 'Twin towers and the IFS podium frame Chunxi Road, giving the district a paired skyline marker.'
    }
  },
  hongkong: {
    year: 1990,
    architect: 'I. M. Pei',
    fact: {
      zh: '贝聿铭用三角形桁架把中银大厦收成四组逐渐升高的棱柱，像一节节生长的竹子。',
      en: 'I. M. Pei’s triangular bracing turns the Bank of China into four rising prisms.'
    }
  },
  xian: {
    year: 2010,
    architect: null,
    fact: {
      zh: '大唐不夜城没有单一超高层，轴线、仿唐屋顶和灯光共同构成曲江的夜间地景。',
      en: 'Datang Everbright City is an axis of Tang-style roofs and light rather than a single tower.'
    }
  },
  chongqing: {
    year: 2020,
    architect: 'Moshe Safdie',
    fact: {
      zh: '四座塔楼由空中连廊连接，来福士在朝天门把山城的高差压成一个横向地标。',
      en: 'Four towers and a skybridge turn Raffles City into a horizontal landmark above Chaotianmen.'
    }
  },
  shenzhen: {
    year: 2017,
    architect: 'KPF',
    fact: {
      zh: '600 米的平安金融中心以八根巨柱和收分塔身，成为福田中心区的最高坐标。',
      en: 'The 600 m Ping An Finance Centre rises on eight mega-columns above Futian.'
    }
  },
  guangzhou: {
    year: 2010,
    architect: 'Mark Hemel & Barbara Kuit',
    fact: {
      zh: '广州塔用扭转的钢格栅把高度变成一条细腰，塔身本身就是珠江边的结构雕塑。',
      en: 'Canton Tower twists a steel lattice into a slender waist above the Pearl River.'
    }
  },
  lhasa: {
    year: '1694',
    architect: null,
    fact: {
      zh: '布达拉宫沿红山山脊展开，白宫与红宫的体量不是塔，而是一座贴着地形的宫堡。',
      en: 'Potala Palace is a ridge-hugging fortress of white and red volumes, not a tower.'
    }
  },
  urumqi: {
    year: 2003,
    architect: null,
    fact: {
      zh: '大巴扎以低层穹顶、砖砌立面和市场街巷组织二道桥，高度让位于街区密度。',
      en: 'The Grand Bazaar is a low-rise field of domes, brick façades and market lanes in Erdaoqiao.'
    }
  },
  taipei: {
    year: 2004,
    architect: 'C. Y. Lee',
    fact: {
      zh: '台北 101 的竹节状塔身和 508 米高度，让信义区在夜里有一条清晰的垂直轴线。',
      en: 'Taipei 101’s bamboo-like segments give Xinyi a clear vertical axis at 508 m.'
    }
  },
  tokyo: {
    year: 1958,
    architect: 'Tachū Naitō',
    fact: {
      zh: '东京塔用红白相间的钢桁架模仿埃菲尔铁塔，却以更轻的塔身成为芝公园的夜航标志。',
      en: 'Tokyo Tower reworks the Eiffel formula in red-and-white steel above Shiba Park.'
    }
  },
  seoul: {
    year: 1975,
    architect: null,
    fact: {
      zh: 'N 首尔塔把观景台放在南山山脊上，塔身不高，却借山势成为全城的视觉坐标。',
      en: 'N Seoul Tower uses Namsan’s ridge as much as its own height to mark the city.'
    }
  },
  singapore: {
    year: 2010,
    architect: 'Moshe Safdie',
    fact: {
      zh: '三座塔楼托起一条横跨 200 米的空中花园，滨海湾金沙把酒店做成了城市尺度的门框。',
      en: 'Three towers carry a 200 m sky park, turning Marina Bay Sands into a city-scale frame.'
    }
  },
  mumbai: {
    year: 1924,
    architect: 'George Wittet',
    fact: {
      zh: '印度门用玄武岩拱门面对阿拉伯海，26 米的高度更像一座进入科拉巴的城市门槛。',
      en: 'The basalt Gateway of India is a 26 m threshold between Colaba and the Arabian Sea.'
    }
  },
  dubai: {
    year: 2010,
    architect: 'Adrian Smith / SOM',
    fact: {
      zh: '哈利法塔以 828 米和阶梯式收分把迪拜市中心拉成一根极细的针，塔尖几乎单独占据天际线。',
      en: 'Burj Khalifa tapers to 828 m, pulling Downtown Dubai into a single needle-like silhouette.'
    }
  },
  moscow: {
    year: 1561,
    architect: 'Postnik Yakovlev',
    fact: {
      zh: '圣瓦西里大教堂把九座洋葱顶叠在红场边缘，色彩和轮廓比高度更有辨识度。',
      en: 'St. Basil’s stacks nine onion domes beside Red Square; colour and silhouette carry it.'
    }
  },
  cairo: {
    year: 'c. 2560 BC',
    architect: 'Hemiunu (attributed)',
    fact: {
      zh: '吉萨金字塔用四个三角形面把 139 米的高度埋进高原，轮廓至今没有被周边城市稀释。',
      en: 'The Giza pyramids hold a 139 m triangle against the plateau, still legible beyond Cairo.'
    }
  },
  capetown: {
    year: 2014,
    architect: 'DHK Architects',
    fact: {
      zh: 'Portside 大厦用深色玻璃和斜切塔冠面向桌山，是开普敦 CBD 少有的高层坐标。',
      en: 'Portside Tower angles its dark glass crown toward Table Mountain above the CBD.'
    }
  },
  london: {
    year: 1859,
    architect: 'Charles Barry & Augustus Pugin',
    fact: {
      zh: '大本钟所在的伊丽莎白塔用哥特复兴细节把 96 米的高度切成一段可读的钟面。',
      en: 'The Elizabeth Tower turns 96 m of Gothic Revival detail into a single clock face.'
    }
  },
  paris: {
    year: 1836,
    architect: 'Jean Chalgrin',
    fact: {
      zh: '凯旋门把 50 米高度压在星形广场的中心，十二条大道从拱门向外放射。',
      en: 'The Arc de Triomphe holds the centre of the star, with twelve avenues radiating outward.'
    }
  },
  newyork: {
    year: 1931,
    architect: 'Shreve, Lamb & Harmon',
    fact: {
      zh: '帝国大厦用 443 米的装饰艺术收分和塔冠，成为曼哈顿中城最稳定的天际线锚点。',
      en: 'The 443 m Empire State Building is Midtown’s most stable Art Deco anchor.'
    }
  },
  sanfrancisco: {
    year: 2018,
    architect: 'Pelli Clarke Pelli',
    fact: {
      zh: 'Salesforce 大厦以 326 米的圆角方塔和通透塔冠，成为市场街南侧的新坐标。',
      en: 'Salesforce Tower’s 326 m rounded shaft and crown mark the south side of Market Street.'
    }
  },
  lasvegas: {
    year: 2014,
    architect: null,
    fact: {
      zh: '豪客摩天轮用 167 米的轮辐把拉斯维加斯大道的高度变成一圈缓慢移动的灯。',
      en: 'The 167 m High Roller turns the Strip’s skyline into a slow ring of light.'
    }
  },
  saopaulo: {
    year: 1965,
    architect: 'Franz Heep',
    fact: {
      zh: '意大利大厦用 168 米的混凝土体量和顶层餐厅，成为共和国广场周边的城市标志。',
      en: 'Edifício Itália marks República with a 168 m concrete shaft and rooftop restaurant.'
    }
  },
  sydney: {
    year: 1981,
    architect: 'Donald Crone',
    fact: {
      zh: '悉尼塔的金色塔冠从海德公园旁升起，309 米的塔身把市中心和港湾连成一条视线。',
      en: 'Sydney Tower’s golden turret rises beside Hyde Park, linking the CBD to the harbour.'
    }
  },
  amsterdam: {
    year: 1631,
    architect: 'Hendrick de Keyser',
    fact: {
      zh: '西教堂的 82 米钟塔是约旦区最高的垂直元素，塔身和运河屋形成强烈尺度对比。',
      en: 'Westerkerk’s 82 m tower is the Jordaan’s tallest vertical against low canal houses.'
    }
  },
  berlin: {
    year: 1791,
    architect: 'Carl Gotthard Langhans',
    fact: {
      zh: '勃兰登堡门用 26 米高的多立克柱廊把菩提树下大街切成一条仪式性的城市轴线。',
      en: 'The Brandenburg Gate’s 26 m colonnade turns Unter den Linden into a ceremonial axis.'
    }
  },
  pyongyang: {
    year: 1987,
    architect: null,
    fact: {
      zh: '柳京饭店以 330 米、105 层的三角锥体量停在大同江边，未完成的状态本身成为地标。',
      en: 'Ryugyong Hotel’s 330 m, 105-storey pyramid remains a landmark precisely because it is unfinished.'
    }
  },
  istanbul: {
    year: 2011,
    architect: 'Tabanlıoğlu Architects',
    fact: {
      zh: 'Sapphire 大厦用 275 米的细长塔身和顶部观景台，在莱文特的高层群里保持一根独立的竖线。',
      en: 'Istanbul Sapphire holds a 275 m vertical line above Levent’s cluster.'
    }
  },
  hochiminh: {
    year: 2010,
    architect: 'Carlos Zapata',
    fact: {
      zh: '金融塔用 262 米的收分塔身和直升机平台，在阮惠步行街尽头形成一枚细长的城市指针。',
      en: 'Bitexco Tower’s 262 m shaft and helipad close the axis of Nguyen Hue.'
    }
  },
  bangkok: {
    year: 2016,
    architect: 'Ole Scheeren',
    fact: {
      zh: '王权云顶大厦用像素化的螺旋切口把 315 米的塔身变成一条向上的城市裂缝。',
      en: 'King Power Mahanakhon cuts a pixelated spiral into its 315 m shaft.'
    }
  },
  toronto: {
    year: 1976,
    architect: 'WZMH Architects',
    fact: {
      zh: 'CN 塔用 553 米的混凝土塔身和观景台，把湖滨和金融区钉在同一条垂直线上。',
      en: 'CN Tower pins Harbourfront to the Financial District with 553 m of concrete and glass.'
    }
  },
  madrid: {
    year: 1764,
    architect: 'Juan Bautista Sachetti',
    fact: {
      zh: '马德里王宫用 33 米的水平体量和石材立面，面对太阳门形成一座低矮而宽阔的宫廷地标。',
      en: 'The Royal Palace is a low, broad stone landmark turned toward Puerta del Sol.'
    }
  },
  rome: {
    year: '80 AD',
    architect: null,
    fact: {
      zh: '斗兽场用 48 米的椭圆立面把古罗马的公共尺度留在城市中心，拱券比高度更有力量。',
      en: 'The Colosseum keeps ancient Rome’s public scale in a 48 m elliptical façade.'
    }
  },
  melbourne: {
    year: 2006,
    architect: 'Fender Katsalidis',
    fact: {
      zh: 'Eureka 大厦用 298 米的玻璃塔身和金色塔冠，在南岸形成一条清晰的垂直坐标。',
      en: 'Eureka Tower’s 298 m glass shaft and gold crown mark Southbank.'
    }
  },
  kualalumpur: {
    year: 1998,
    architect: 'César Pelli',
    fact: {
      zh: '双峰塔用 452 米的塔身和空中连桥，把吉隆坡的市中心收成一对对称的尖塔。',
      en: 'The Petronas Towers pair 452 m shafts with a skybridge at the centre of Kuala Lumpur.'
    }
  },
  chicago: {
    year: 1974,
    architect: 'SOM / Fazlur Khan',
    fact: {
      zh: '威利斯大厦用 442 米的屋顶高度和九筒结构，把芝加哥的工程传统压成一支方形黑塔。',
      en: 'Willis Tower’s 442 m roof and bundled-tube structure compress Chicago’s engineering tradition into a dark square.'
    }
  },
  barcelona: {
    year: '1882–',
    architect: 'Antoni Gaudí',
    fact: {
      zh: '圣家堂用 172 米的未完成塔群和有机石柱，把巴塞罗那的街区网格变成一座持续生长的模型。',
      en: 'Sagrada Família’s unfinished 172 m towers turn Barcelona’s grid into a model that keeps growing.'
    }
  },
  santiago: {
    year: 2013,
    architect: 'Pelli Clarke Pelli',
    fact: {
      zh: 'Gran Torre 用 300 米的玻璃塔身成为圣地亚哥的新高度，也把安第斯山的轮廓带进城市天际线。',
      en: 'Gran Torre Santiago adds a 300 m glass marker to a skyline framed by the Andes.'
    }
  },
  casablanca: {
    year: 1993,
    architect: 'Michel Pinseau',
    fact: {
      zh: '哈桑二世清真寺把 210 米的宣礼塔放在大西洋岸边，塔身和海面共享一条轴线。',
      en: 'Hassan II Mosque sets its 210 m minaret on the Atlantic edge of Casablanca.'
    }
  },
  osaka: {
    year: 2014,
    architect: 'César Pelli',
    fact: {
      zh: '阿倍野 Harukas 用 300 米的塔身和顶部观景台，把大阪南部的城市网格拉到一条垂直线上。',
      en: 'Abeno Harukas lifts Osaka’s southern grid into a 300 m vertical.'
    }
  },
  jakarta: {
    year: 1975,
    architect: 'Soedarsono',
    fact: {
      zh: '国家纪念碑用 137 米的方尖碑和顶部火焰，把独立广场变成雅加达的轴线中心。',
      en: 'Monas turns Merdeka Square into Jakarta’s axis with a 137 m obelisk and flame.'
    }
  },
  nanjing: {
    year: 2010,
    architect: 'SOM',
    fact: {
      zh: '紫峰大厦用 450 米的收分塔身和三角形平面，在鼓楼区形成一根带棱线的城市指针。',
      en: 'Zifeng Tower’s 450 m tapered shaft and triangular plan mark the Gulou district.'
    }
  },
  marrakech: {
    year: '1199',
    architect: null,
    fact: {
      zh: '马拉喀什的杰马夫纳广场没有单一高楼，宣礼塔、市集和露天广场共同构成麦地那的低层轮廓。',
      en: 'Jemaa el-Fna is a low medina ensemble of minaret, market and square rather than a tower.'
    }
  },
  vancouver: {
    year: 2008,
    architect: 'James K. M. Cheng',
    fact: {
      zh: '香格里拉大厦用 201 米的玻璃塔身和混合用途基座，把温哥华市中心的住宅密度带上天际线。',
      en: 'Living Shangri-La brings 201 m of residential density to downtown Vancouver.'
    }
  },
  nantong: {
    year: null,
    architect: null,
    fact: {
      zh: '濠河把南通老城圈成一条闭合的水轴，低层街巷和河岸共同构成这座城市的可见边界。',
      en: 'The Hao River loops Nantong’s old town into a closed water axis, with low lanes and embankments forming its visible edge.'
    }
  },
  anqing: {
    year: 1570,
    architect: null,
    fact: {
      zh: '振风塔立在迎江寺与长江之间，七层八角砖木塔身把安庆老城和江面收进同一根垂直轴线。',
      en: 'Zhenfeng Pagoda rises between Yingjiang Temple and the Yangtze, tying Anqing’s old town to the river in one vertical axis.'
    }
  }
};
