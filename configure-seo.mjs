import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const configPath=path.join(root,'site-config.json');
const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
const requestedOrigin=process.argv[2]||config.origin;
const parsed=new URL(requestedOrigin);
if(parsed.protocol!=='https:'||parsed.pathname!=='/'||parsed.search||parsed.hash||parsed.username||parsed.password)throw Error('Use an HTTPS origin only, such as https://yonoviprtp.com');
const origin=parsed.origin,url=origin+'/',image=origin+'/assets/yonovip-og.jpg';
config.origin=origin;fs.writeFileSync(configPath,JSON.stringify(config,null,2)+'\n');
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const title='YonoVIP Games & Android App Download Guide';
const description='Find YonoVIP games, save your picks and get Android app download help. Read simple game guides, app update steps and RTP information.';
const imageAlt='YonoVIP green and gold logo with the words Find your game. Get YonoVIP. Android app, 18+.';
const graph={'@context':'https://schema.org','@graph':[
 {'@type':'WebSite','@id':url+'#website',url,name:'YonoVIP',alternateName:'Yono VIP',description,inLanguage:'en-IN'},
 {'@type':'WebPage','@id':url+'#webpage',url,name:title,description,inLanguage:'en-IN',isPartOf:{'@id':url+'#website'},primaryImageOfPage:{'@id':url+'#social-image'}},
 {'@type':'ImageObject','@id':url+'#social-image',url:image,contentUrl:image,width:1200,height:630,caption:imageAlt}
]};
const head=`<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#09170f">
  <meta name="color-scheme" content="dark">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="YonoVIP">
  <meta property="og:locale" content="en_IN">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escape(imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escape(title)}">
  <meta name="twitter:description" content="${escape(description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${escape(imageAlt)}">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/yonovip-32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/yonovip-180.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="motion.css">
  <link rel="stylesheet" href="games.css">
  <script type="application/ld+json">${JSON.stringify(graph).replaceAll('<','\\u003c')}</script>
</head>`;
const dist=path.join(root,'dist');
const htmlPath=path.join(dist,'index.html');
fs.writeFileSync(htmlPath,fs.readFileSync(htmlPath,'utf8').replace(/<head>[\s\S]*?<\/head>/,head));
fs.writeFileSync(path.join(dist,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
fs.writeFileSync(path.join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}</loc></url>\n</urlset>\n`);
fs.writeFileSync(path.join(dist,'site.webmanifest'),JSON.stringify({id:'/',name:'YonoVIP Games & App Download',short_name:'YonoVIP',description,start_url:'/',scope:'/',display:'browser',lang:'en-IN',background_color:'#080f0b',theme_color:'#09170f',icons:[192,512].map(n=>({src:`/assets/yonovip-${n}.png`,sizes:`${n}x${n}`,type:'image/png',purpose:'any'}))},null,2)+'\n');
console.log('Updated metadata, social cards, structured data, manifest, canonical, robots.txt and sitemap for '+url);
