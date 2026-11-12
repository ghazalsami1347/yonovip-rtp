const modal=document.querySelector('#modal'),content=document.querySelector('#modalContent'),empty=document.querySelector('#empty');
const downloadURL='https://yonovipapp.vip/?code=ZFW3U5NM1U9';
const cards=[...document.querySelectorAll('.game-card')];
const knownIds=new Set(cards.map(c=>c.dataset.gameId));
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const connection=navigator.connection;
const saved=new Set();
try{const stored=JSON.parse(localStorage.getItem('yonovip-saved-games')||'[]');if(Array.isArray(stored))stored.filter(id=>knownIds.has(id)).forEach(id=>saved.add(id))}catch{}
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const icon=name=>`<svg class="icon" width="24" height="24" aria-hidden="true" focusable="false"><use href="#game-icon-${name}"></use></svg>`;
const TOP_GAME_COUNT=10;
let activeView='all',activeGame=null,toastTimer=null,ticker=null;
let currentDay,rotationTimer;
const visible=new Set();
const rates=new Map(cards.map(card=>[card.dataset.gameId,parseFloat(card.querySelector('[data-rate]').textContent)]));

const IST_MS=5.5*3600000,ROTATE_MS=12*3600000,DAY_MS=86400000;
const rotationKey=now=>new Date(now+IST_MS-ROTATE_MS).toISOString().slice(0,10);
const msUntilRotation=now=>{const shifted=now+IST_MS-ROTATE_MS;return (Math.floor(shifted/DAY_MS)+1)*DAY_MS-shifted};
function hashFrac(text){let h=2166136261;for(const ch of text){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return (h>>>0)/4294967296}
function applyDailyDemoRates(day){
  const order=[...cards].sort((a,b)=>
    hashFrac(day+a.dataset.gameId)-hashFrac(day+b.dataset.gameId)
    ||a.dataset.gameId.localeCompare(b.dataset.gameId,'en-IN')
  );
  const [yyyy,mm,dd]=day.split('-');
  const floor=9701+Math.floor(hashFrac(day+'featured-floor')*17);
  document.querySelector('#rtpUpdated').innerHTML='Last update <b>12:00:00 '+dd+'/'+mm+'/'+yyyy.slice(2)+'</b> IST<br>Refreshes every day at 12:00 PM IST';
  order.forEach((card,index)=>{
    const id=card.dataset.gameId;
    const jitter=Math.floor(hashFrac(day+'featured'+id)*7);
    // Reserve a separate band above 97% for the daily top ten.
    const basisPoints=index<TOP_GAME_COUNT
      ?floor+(TOP_GAME_COUNT-1-index)*8+jitter
      :9700-Math.round((9700-4600)*(index-TOP_GAME_COUNT)/Math.max(1,order.length-TOP_GAME_COUNT-1));
    const value=basisPoints/100;
    rates.set(id,value);
    card.querySelector('[data-rate-value]').textContent=value.toFixed(2)+'%';
    card.querySelector('.game-meter i').style.transform='scaleX('+(value/100)+')';
  });
}
function sortByRate(){const grid=cards[0].parentElement;const sorted=[...cards].sort((a,b)=>rates.get(b.dataset.gameId)-rates.get(a.dataset.gameId)||a.dataset.gameId.localeCompare(b.dataset.gameId,'en-IN'));if(sorted.every((card,i)=>card===cards[i]))return false;cards.splice(0,cards.length,...sorted);cards.forEach(card=>grid.append(card));return true}
function rateMarkup(value,trend='flat'){return '<svg class="icon trend-icon" width="14" height="14" aria-hidden="true" focusable="false"><use href="#game-icon-trend-'+(trend==='down'?'down':'up')+'"></use></svg><span data-rate-value>'+value.toFixed(2)+'%</span>'}
function calculateRate(previous,random=Math.random){const step=(1+Math.floor(random()*35))/100;let value=Math.round(Math.max(90,Math.min(98,previous+(random()<.5?-step:step)))*100)/100;if(value===previous)value=Number((previous+(previous>=98?-.01:.01)).toFixed(2));return {value,trend:value>previous?'up':'down'}}
function paintRate(node,value,trend){node.dataset.trend=trend;node.querySelector('[data-rate-value]').textContent=value.toFixed(2)+'%';node.querySelector('use').setAttribute('href','#game-icon-trend-'+trend)}

function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500)}
function openDialog(html){content.innerHTML=html;modal.showModal();window.yonoMotion?.dialog()}
function explain(){activeGame=null;openDialog('<div class="eyebrow">GAME HELP</div><h2 id="dialogTitle">What is RTP?</h2><p>RTP (Return to Player) is the percentage of money a gambling game is expected to pay back to players over time.</p><p>For example, if a slot game has a 96% RTP, it means that for every ₹100 wagered, the game is expected to return ₹96 to players and keep ₹4 for the casino.</p><p>Check the rules inside each game for its actual RTP.</p>')}
function markSaved(button,card){const isSaved=saved.has(card.dataset.gameId);button.setAttribute('aria-pressed',String(isSaved));button.setAttribute('aria-label',(isSaved?'Unsave ':'Save ')+card.dataset.gameName);button.innerHTML=icon(isSaved?'heart-fill':'heart')+(button.classList.contains('sample-save')?(isSaved?' Saved Game':' Save Game'):'')}
function render(){
  const query=document.querySelector('#search').value.trim().toLocaleLowerCase('en-IN');
  const lineup=cards.slice(0,TOP_GAME_COUNT);
  const savedCount=lineup.filter(card=>saved.has(card.dataset.gameId)).length;
  const matching=lineup.filter(card=>(activeView!=='favorites'||saved.has(card.dataset.gameId))&&card.dataset.gameName.toLocaleLowerCase('en-IN').includes(query));
  const shown=new Set(matching);
  for(const card of cards){
    card.hidden=!shown.has(card);
    if(shown.has(card))markSaved(card.querySelector('.game-save'),card);
  }
  const noSaved=activeView==='favorites'&&!query;
  empty.hidden=matching.length>0;
  empty.querySelector('h3').textContent=noSaved?'No saved games in today’s lineup':'No games found';
  empty.querySelector('p').textContent=noSaved?'Tap the heart to save a game. Bookmarks appear here when the game is in the daily top 10.':'Try another game name.';
  document.querySelector('#savedCount').textContent=savedCount;
  document.querySelector('#favoriteCount').textContent=savedCount;
  document.querySelector('#resultCount').textContent=matching.length+' of '+lineup.length+' featured games';
  document.querySelectorAll('[data-view]').forEach(b=>{
    const selected=b.dataset.view===activeView;
    b.classList.toggle('selected',selected);
    b.setAttribute('aria-pressed',String(selected));
  });
  document.querySelector('#savedNav').classList.toggle('current',activeView==='favorites');
  document.querySelector('.quick-nav>a').classList.toggle('current',activeView==='all');
}
function toggleSave(card,button){const id=card.dataset.gameId;if(saved.has(id))saved.delete(id);else saved.add(id);let persisted=true;try{localStorage.setItem('yonovip-saved-games',JSON.stringify([...saved]))}catch{persisted=false}render();if(button?.classList.contains('sample-save'))markSaved(button,card);window.yonoMotion?.saved(button||card.querySelector('.game-save'));toast(saved.has(id)?(persisted?'Game saved':'Game saved for this visit'):'Game removed from saved')}
function openGame(card){activeGame=card;const name=card.dataset.gameName,image=card.querySelector('img'),rate=rates.get(card.dataset.gameId);openDialog(`<div class="eyebrow">YONOVIP GAME</div><h2 id="dialogTitle">${esc(name)}</h2><img class="modal-cover" src="${esc(image.getAttribute('src'))}" width="320" height="320" alt="${esc(name)} game artwork"><div class="sample-meta"><span>Simulated RTP</span><strong id="modalRate" data-trend="${card.querySelector('[data-rate]').dataset.trend}">${rateMarkup(rate,card.querySelector('[data-rate]').dataset.trend)}</strong></div><div class="meter" aria-hidden="true"><i id="modalBar" data-trend="${card.querySelector('[data-rate]').dataset.trend}" style="transform:scaleX(${rate/100})"></i></div><p class="simulated">Play The Game now, Download the APP!.</p><button class="sample-save" id="modalSave" aria-pressed="false">Save Game</button><a class="modal-download" href="${esc(downloadURL)}">${icon('download-simple')} Download App</a><p class="modal-note">Opens YonoVIP. Find ${esc(name)} inside the app.</p>`);const button=document.querySelector('#modalSave');markSaved(button,card);button.onclick=()=>toggleSave(card,button)}
function setView(view){const changed=activeView!==view;activeView=view;document.querySelector('#search').value='';render();if(changed)window.yonoMotion?.swap(document.querySelector('.tabs'))}
for(const card of cards){const button=card.querySelector('.game-save');button.hidden=false;button.onclick=()=>toggleSave(card,button);card.querySelector('.game-open').addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();openGame(card)})}
document.querySelectorAll('#about,#footerAbout').forEach(b=>b.onclick=explain);
modal.querySelector('.close').onclick=()=>modal.close();modal.addEventListener('close',()=>{activeGame=null});modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close()}});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));document.querySelector('#savedNav').onclick=()=>{setView('favorites');document.querySelector('#games').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'})};document.querySelector('.quick-nav>a').addEventListener('click',()=>setView('all'));
document.querySelector('#search').addEventListener('input',render);
document.addEventListener('keydown',event=>{if(event.key==='/'&&!modal.open&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();document.querySelector('#search').focus()}});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target)})},{threshold:.1});cards.forEach(card=>observer.observe(card))}
function updateRate(card){const id=card.dataset.gameId;const {value,trend}=calculateRate(rates.get(id));rates.set(id,value);paintRate(card.querySelector('[data-rate]'),value,trend);const bar=card.querySelector('.game-meter i');bar.dataset.trend=trend;bar.style.transform='scaleX('+(value/100)+')';if(activeGame===card&&modal.open){paintRate(document.querySelector('#modalRate'),value,trend);const modalBar=document.querySelector('#modalBar');modalBar.dataset.trend=trend;modalBar.style.transform='scaleX('+(value/100)+')'}}
function tick(){if(document.hidden)return;if(modal.open){if(activeGame)updateRate(activeGame);return}const onScreen=[...visible].filter(card=>!card.hidden);if(!onScreen.length)return;for(const card of onScreen)updateRate(card)}
const LIVE_DRIFT=false;
function syncTicker(){clearInterval(ticker);ticker=null;if(LIVE_DRIFT&&!document.hidden&&!reducedMotion.matches&&!connection?.saveData)ticker=setInterval(tick,1000)}
function syncRotation(){
  clearTimeout(rotationTimer);
  const now=Date.now();
  const day=rotationKey(now);
  if(day!==currentDay){
    currentDay=day;
    applyDailyDemoRates(day);
    sortByRate();
    render();
    document.querySelector("#grid").dataset.ranked="true";
    if(modal.open&&activeGame){
      if(!cards.slice(0,TOP_GAME_COUNT).includes(activeGame))modal.close();
      else {
        const rate=rates.get(activeGame.dataset.gameId);
        document.querySelector('#modalRate [data-rate-value]').textContent=rate.toFixed(2)+'%';
        document.querySelector('#modalBar').style.transform='scaleX('+(rate/100)+')';
      }
    }
  }
  rotationTimer=setTimeout(syncRotation,msUntilRotation(now));
}
syncRotation();
syncTicker();
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden)syncRotation();
  syncTicker();
});
reducedMotion.addEventListener?.('change',syncTicker);
connection?.addEventListener?.('change',syncTicker);
addEventListener('pagehide',()=>{
  clearTimeout(rotationTimer);
  clearInterval(ticker);
});
addEventListener('pageshow',()=>{
  syncRotation();
  syncTicker();
});
