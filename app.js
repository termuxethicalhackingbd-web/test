// Simple frontend demo logic for Staro MVP (no backend)
// stores data in localStorage so values persist on reload

const DEFAULT = {
  star: 5000,
  token: 125000,
  freeLeft: 1,
  spins: 0,
  boost: 1,
  nfts: [
    {id:1,name:'Mini Pepe #95',tier:'common'},
    {id:2,name:'Matrix Pepe #900',tier:'rare'}
  ],
  leaderboards: {
    spins: [
      {name:'DarkKnight',val:278},{name:'GhostPepe',val:244},{name:'MatrixKing',val:210}
    ],
    miners: [
      {name:'DarkKnight',val:12450000},{name:'MatrixKing',val:8320000}
    ],
    collectors: [
      {name:'DarkKnight',nfts:45,val:185000},{name:'MatrixKing',nfts:38,val:156000}
    ]
  }
};

function loadState(){
  const s = localStorage.getItem('staro_state');
  if (!s){ localStorage.setItem('staro_state', JSON.stringify(DEFAULT)); return JSON.parse(JSON.stringify(DEFAULT)); }
  return JSON.parse(s);
}
function saveState(st){ localStorage.setItem('staro_state', JSON.stringify(st)); }

let state = loadState();
const el = {
  starBal: document.getElementById('starBal'),
  tokenBal: document.getElementById('tokenBal'),
  freeLeft: document.getElementById('freeLeft'),
  spinLog: document.getElementById('spinLog'),
  nftGrid: document.getElementById('nftGrid'),
  leaderboard: document.getElementById('leaderboard'),
  paidSpinBtn: document.getElementById('paidSpinBtn'),
  freeSpinBtn: document.getElementById('freeSpinBtn'),
  resultModal: document.getElementById('resultModal'),
  resultTitle: document.getElementById('resultTitle'),
  resultBody: document.getElementById('resultBody'),
  closeResult: document.getElementById('closeResult'),
  tabs: document.querySelectorAll('.tab')
};

function refreshUI(){
  el.starBal.innerText = state.star;
  el.tokenBal.innerText = state.token;
  el.freeLeft.innerText = state.freeLeft;
  renderNFTs();
  renderLeaderboard('spins');
}
function renderNFTs(){
  el.nftGrid.innerHTML = '';
  if (!state.nfts.length) el.nftGrid.innerHTML = '<div class="muted">No NFTs yet</div>';
  state.nfts.forEach(n=>{
    const div = document.createElement('div'); div.className='nft';
    const img = document.createElement('div'); img.style.height='82px'; img.style.background='#0b2230'; img.style.borderRadius='6px';
    img.style.display='flex'; img.style.alignItems='center'; img.style.justifyContent='center'; img.style.fontSize='18px';
    img.innerText = n.tier.toUpperCase();
    div.appendChild(img);
    const name = document.createElement('div'); name.style.marginTop='6px'; name.innerText = n.name;
    const sell = document.createElement('button'); sell.className='small'; sell.style.marginTop='8px'; sell.innerText='Sell';
    sell.onclick = ()=>sellNFT(n.id);
    div.appendChild(name); div.appendChild(sell);
    el.nftGrid.appendChild(div);
  });
}
function renderLeaderboard(tab){
  let html = '';
  if (tab==='spins'){
    html = state.leaderboards.spins.map((s,i)=>`${i+1}. ${s.name} — ${s.val} Spins`).join('<br>');
  } else if (tab==='miners'){
    html = state.leaderboards.miners.map((s,i)=>`${i+1}. ${s.name} — ${s.val} Tokens`).join('<br>');
  } else {
    html = state.leaderboards.collectors.map((s,i)=>`${i+1}. ${s.name} — ${s.nfts} NFTs (~${s.val}⭐)`).join('<br>');
  }
  el.leaderboard.innerHTML = html;
}

function sellNFT(id){
  const idx = state.nfts.findIndex(x=>x.id===id);
  if (idx===-1) return;
  const nft = state.nfts[idx];
  let price = 500;
  if (nft.tier==='rare') price = 1000;
  if (nft.tier==='legendary') price = 5000;
  // confirm sell
  if (!confirm(`Sell ${nft.name} for ${price} ⭐ ?`)) return;
  state.star += price;
  state.nfts.splice(idx,1);
  saveState(state); refreshUI();
  showResult('Sold NFT', `You sold ${nft.name} for ${price} ⭐`);
}

function showResult(title, text){
  el.resultTitle.innerText = title;
  el.resultBody.innerText = text;
  el.resultModal.classList.remove('hidden');
}
el.closeResult.onclick = ()=>{ el.resultModal.classList.add('hidden'); }

// Tab clicks
el.tabs.forEach(t=>{
  t.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    renderLeaderboard(t.dataset.tab);
  });
});

function weightedRandPaid(boost){
  // base: 85% common, 10% medium, 2% high, 3% star
  const table = {
    1:[85,10,2,3],
    2:[82.5,12,2.5,3],
    5:[78,14.5,4.5,3],
    10:[72,17,8,3],
    50:[50,25,22,3]
  };
  const row = table[boost] || table[1];
  const r = Math.random()*100;
  if (r < row[0]) return 'common';
  if (r < row[0]+row[1]) return 'medium';
  if (r < row[0]+row[1]+row[2]) return 'high';
  return 'star';
}

function paidSpin(){
  if (state.star < 200){ alert('Not enough Stars (200 ⭐ needed)'); return; }
  state.star -= 200;
  const tier = weightedRandPaid(state.boost);
  if (tier==='common'){
    const id = Date.now(); const name = `Common Pepe #${Math.floor(Math.random()*10000)}`;
    state.nfts.push({id,name,tier:'common'});
    showResult('Common NFT!', `You won ${name}`);
  } else if (tier==='medium'){
    const id = Date.now(); const name = `Rare Pepe #${Math.floor(Math.random()*10000)}`;
    state.nfts.push({id,name,tier:'rare'});
    showResult('Rare NFT!', `You won ${name}`);
  } else if (tier==='high'){
    const id = Date.now(); const name = `Legendary Pepe #${Math.floor(Math.random()*10000)}`;
    state.nfts.push({id,name,tier:'legendary'});
    showResult('Legendary NFT!!!', `You won ${name}`);
  } else {
    const s = Math.floor(50 + Math.random()*950);
    state.star += s;
    showResult('Star Reward', `You got ${s} ⭐ back`);
  }
  state.spins += 1;
  saveState(state); refreshUI();
}

function freeSpin(){
  if (state.freeLeft <= 0){ alert('Free spin used for today'); return; }
  // free: token 10k-100k (34.99%), star small (50%), nothing 5.01% -> We simplify
  const r = Math.random()*100;
  if (r < 50){ // star
    const s = Math.floor(10 + Math.random()*41); state.star += s; showResult('Free Star', `You got ${s} ⭐`); 
  } else if (r < 85){ // token
    const t = Math.floor(10000 + Math.random()*90001); state.token += t; showResult('Free Tokens', `You got ${t} Token`); 
  } else if (r < 95){ // common nft (if you want no NFT on free, remove this branch)
    const id = Date.now(); const name = `Common Pepe #${Math.floor(Math.random()*10000)}`;
    state.nfts.push({id,name,tier:'common'}); showResult('Common NFT', `You won ${name}`);
  } else {
    showResult('No Win', `Better luck next time`);
  }
  state.freeLeft -= 1;
  saveState(state); refreshUI();
}

// boost activation (demo: no real payment)
document.querySelectorAll('.boost .small').forEach(b=>{
  b.onclick = ()=>{
    const pack = Number(b.dataset.pack);
    state.boost = pack;
    saveState(state); refreshUI();
    alert(`Boost ×${pack} activated (demo)`);
  };
});

el.paidSpinBtn.onclick = paidSpin;
el.freeSpinBtn.onclick = freeSpin;

refreshUI();
