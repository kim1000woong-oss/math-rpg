import { useState, useEffect, useRef, useCallback } from "react";
const PF = "'Press Start 2P', monospace";
const ri = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const sh = a => { const x=[...a]; for(let i=x.length-1;i>0;i--){const j=ri(0,i);[x[i],x[j]]=[x[j],x[i]];} return x; };

let _ac=null;
function getAc(){if(!_ac)_ac=new(window.AudioContext||window.webkitAudioContext)();return _ac;}
function tn(f,tp,d,v,dl){try{const c=getAc(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type=tp;const t=c.currentTime+(dl||0);o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(v||0.18,t);g.gain.exponentialRampToValueAtTime(0.001,t+d);o.start(t);o.stop(t+d);}catch(e){}}
function mel(ns,bpm){const b=60/(bpm||155);let t=0;ns.forEach(n=>{if(n[0]>0)tn(n[0],"square",b*n[1]*0.82,0.16,t);t+=b*n[1];});}
const SFX={
  attack:()=>{tn(440,"square",0.06,0.22);tn(330,"square",0.08,0.18,0.06);},
  bow:()=>{[880,660,440].forEach((f,i)=>tn(f,"sawtooth",0.05,0.14,i*0.04));},
  staff:()=>{[523,659,784,1047].forEach((f,i)=>tn(f,"sine",0.1,0.18,i*0.05));},
  dagger:()=>{tn(1200,"sawtooth",0.03,0.18);tn(900,"sawtooth",0.04,0.14,0.03);},
  miss:()=>{tn(220,"sawtooth",0.1,0.25);tn(165,"sawtooth",0.14,0.22,0.1);},
  correct:()=>{[523,659,784].forEach((f,i)=>tn(f,"square",0.08,0.2,i*0.09));},
  wrong:()=>{tn(200,"square",0.1,0.28);tn(160,"square",0.14,0.28,0.1);},
  itemGet:()=>{[392,494,587,784,988].forEach((f,i)=>tn(f,"square",0.12,0.22,i*0.07));},
  clear:()=>{[523,659,784,1047,784,1047,1319].forEach((f,i)=>tn(f,"square",0.14,0.26,i*0.1));},
  revive:()=>{[262,330,392,523,659,784,1047].forEach((f,i)=>tn(f,"sine",0.16,0.26,i*0.09));},
  boss:()=>{[150,120,100,80].forEach((f,i)=>tn(f,"sawtooth",0.18,0.32,i*0.12));},
  timeout:()=>{tn(180,"sawtooth",0.18,0.38);tn(140,"sawtooth",0.22,0.38,0.16);},
  coin:()=>{[523,659,784].forEach((f,i)=>tn(f,"sine",0.06,0.2,i*0.04));},
  shop:()=>{[392,494,659,784].forEach((f,i)=>tn(f,"square",0.1,0.2,i*0.06));},
  buy:()=>{[523,784,1047].forEach((f,i)=>tn(f,"square",0.12,0.25,i*0.08));},
  roul:()=>tn(880,"square",0.03,0.14),
  roulEnd:()=>{[523,659,784,1047,784,1047].forEach((f,i)=>tn(f,"square",0.12,0.28,i*0.08));},
};
const BGMS={
  title:[[523,1],[659,1],[784,1],[1047,2],[784,1],[659,1],[523,2],[440,1],[523,1],[659,1],[784,2],[0,2]],
  s0:[[523,1],[659,1],[784,1],[659,1],[523,2],[392,1],[440,1],[494,1],[587,1],[659,2],[0,2]],
  s1:[[330,1],[370,1],[415,2],[370,1],[330,1],[294,2],[262,1],[294,1],[330,1],[370,2],[0,2]],
  s2:[[659,2],[587,1],[523,2],[494,1],[440,2],[392,1],[440,1],[494,2],[0,2]],
  s3:[[220,1],[233,1],[220,1],[0,1],[196,1],[220,1],[196,1],[0,1],[175,1],[196,1],[220,2],[0,2]],
  s4:[[784,2],[880,1],[988,2],[880,1],[784,2],[698,1],[784,1],[880,2],[0,2]],
  s5:[[262,2],[0,1],[294,1],[330,2],[0,1],[262,2],[220,1],[0,1],[247,1],[262,2],[0,2]],
  s6:[[175,1],[196,1],[220,1],[233,1],[247,2],[233,1],[220,1],[175,1],[196,1],[220,2],[0,2]],
  shop:[[392,1],[440,1],[494,1],[523,2],[494,1],[440,1],[392,2],[0,2]],
};
let _bt=null,_bs=false;
function playBGM(key,bpm){
  _bs=true;clearTimeout(_bt);
  setTimeout(()=>{_bs=false;const ns=BGMS[key];if(!ns)return;const b=60/(bpm||155),tot=ns.reduce((s,n)=>s+b*n[1],0);const loop=()=>{if(_bs)return;mel(ns,bpm);_bt=setTimeout(loop,tot*1000);};loop();},120);
}

function rollGrade(){const r=ri(1,100);if(r<=10)return 3;if(r<=30)return 2;if(r<=60)return 1;return 0;}
const GC=["#8B7355","#9E9E9E","#FFD700","#a855f7","#00f0ff"];
const GN=["일반","고급","희귀","전설","슈퍼전설"];
const GP=["40%","30%","20%","10%","업글만"];

const PETS=[
  {id:0,name:"아기 슬라임",emoji:"🟢",cost:120,hintCount:1,grade:0,desc:"힌트 1회"},
  {id:1,name:"요정",emoji:"🧚",cost:200,hintCount:2,grade:1,desc:"힌트 2회"},
  {id:2,name:"불꽃 고양이",emoji:"🔥🐱",cost:320,hintCount:3,grade:2,desc:"힌트 3회"},
  {id:3,name:"전설 드래곤",emoji:"🐉",cost:500,hintCount:4,grade:3,desc:"힌트 4회"},
];

const JOBS=[
  {id:"warrior",name:"검사",icon:"⚔️",color:"#e74c3c",desc:"강한 공격력\n보스 배율 최강",di:["⚔️","🛡️","🛡️","🔥","📖","🌟"],dn:[["나무검","철검","황금검","전설검","슈퍼전설검"],["나무방패","철방패","황금방패","전설방패","슈퍼전설방패"],["견습갑옷","기사갑옷","성기사갑옷","전설갑옷","슈퍼전설갑옷"],["붉은돌","화염석","업화석","전설화염","슈퍼전설화염"],["마법서","고대서","신성서","전설서","슈퍼전설서"],["별조각","별수정","성운석","우주의핵","슈퍼우주의핵"]]},
  {id:"archer",name:"궁수",icon:"🏹",color:"#27ae60",desc:"빠른 속도\n콤보 보너스 최강",di:["🏹","🪃","🧥","🔥","🔭","🌟"],dn:[["나무활","철활","황금활","전설활","슈퍼전설활"],["화살통","강철화살","황금화살","전설화살","슈퍼전설화살"],["가죽갑옷","사슬갑옷","용가죽갑옷","전설갑옷","슈퍼전설갑옷"],["붉은돌","화염석","업화석","전설화염","슈퍼전설화염"],["조준경","수정조준경","황금조준경","전설조준경","슈퍼전설조준경"],["별조각","별수정","성운석","우주의핵","슈퍼우주의핵"]]},
  {id:"mage",name:"마법사",icon:"🪄",color:"#9b59b6",desc:"강력한 마법\n시간 연장 최강",di:["🪄","🔮","👘","🔥","📖","🌟"],dn:[["나무지팡이","수정지팡이","황금지팡이","전설지팡이","슈퍼전설지팡이"],["마법구","수정구","황금구","전설구","슈퍼전설구"],["견습로브","마법로브","현자로브","전설로브","슈퍼전설로브"],["붉은돌","화염석","업화석","전설화염","슈퍼전설화염"],["마법서","고대서","신성서","전설서","슈퍼전설서"],["별조각","별수정","성운석","우주의핵","슈퍼우주의핵"]]},
  {id:"rogue",name:"도적",icon:"🗡️",color:"#f39c12",desc:"날렵한 움직임\n점수 보너스 최강",di:["🗡️","🧣","👢","🔥","☠️","🌟"],dn:[["단검","은단검","독단검","전설단검","슈퍼전설단검"],["망토","은망토","어둠망토","전설망토","슈퍼전설망토"],["도적장화","은장화","그림자장화","전설장화","슈퍼전설장화"],["붉은돌","화염석","업화석","전설화염","슈퍼전설화염"],["독병","강독병","맹독병","전설독병","슈퍼전설독병"],["별조각","별수정","성운석","우주의핵","슈퍼우주의핵"]]},
];

const STAGES=[
  {bg:["#87CEEB","#5a9e3a","#90EE90"],ground:"#5D4037",accent:"#388E3C",label:"🌲 숲",bk:"s0"},
  {bg:["#00897B","#1B5E20","#2E7D32"],ground:"#4E342E",accent:"#1B5E20",label:"🌴 밀림",bk:"s1"},
  {bg:["#B3E5FC","#E0F7FA","#e8f8ff"],ground:"#90CAF9",accent:"#0288D1",label:"❄️ 북극",bk:"s2"},
  {bg:["#1a0000","#b71c1c","#e64a19"],ground:"#37474F",accent:"#D32F2F",label:"🔥 지옥",bk:"s3"},
  {bg:["#E8EAF6","#fff9c4","#FFF9C4"],ground:"#F5F5F5",accent:"#7E57C2",label:"☁️ 천국",bk:"s4"},
  {bg:["#000011","#0D0D2B","#1a1a4e"],ground:"#263238",accent:"#4FC3F7",label:"🚀 우주",bk:"s5"},
  {bg:["#1a0a2e","#2d1b4e","#4a2060"],ground:"#2d1b4e",accent:"#E040FB",label:"🏰 최종성",bk:"s6"},
];
const UID=[1,2,3,4,5,6];
const UNAME={1:"덧셈/뺄셈",2:"평면도형",3:"나눗셈",4:"곱셈",5:"길이와 시간",6:"분수/소수"};
const mkUnits=()=>sh([...UID]).map(u=>({u,n:UNAME[u]}));
const MNAMES=[["슬라임","고블린","불꽃마왕"],["독개구리","독뱀","도형골렘"],["눈사람","얼음곰","분열마법사"],["악마","불악령","증식드래곤"],["천사","세라핌","시간수호자"],["외계인","안드로이드","혼돈마법왕"],["수수께끼괴물","말장난귀신","최종보스"]];
const MC=["#4CAF50","#8BC34A","#e53935","#66BB6A","#558B2F","#FF8F00","#90CAF9","#42A5F5","#1565C0","#e53935","#FF6D00","#b71c1c","#F48FB1","#CE93D8","#7E57C2","#69F0AE","#4FC3F7","#E040FB","#9C27B0","#E91E63","#FF5722"];

const NP=[
  {q:"형제가 싸울 때 동생 편만 드는 세상은?",a:"형편없는세상"},
  {q:"9가 자기소개하면?",a:"전구"},
  {q:"가장 인기 있는 벌레는?",a:"스타벅스"},
  {q:"매일 미안해하는 동물은?",a:"오소리"},
  {q:"도둑이 가장 싫어하는 과자는?",a:"누네띠네"},
  {q:"굴이 감을 보고 한 말은?",a:"유감"},
  {q:"소가 죽으면?",a:"다이소"},
  {q:"아이스크림이 가수가 될 수 없는 이유?",a:"녹음안되니깐"},
  {q:"과자가 자기소개 하면?",a:"전과자"},
  {q:"세상에서 가장 지루한 중학교는?",a:"로딩중"},
  {q:"독수리가 타오르면?",a:"이글이글"},
  {q:"어부들이 싫어하는 가수는?",a:"배철수"},
  {q:"닭에게 사이즈가 작은 옷을 입히면?",a:"꼭끼오"},
  {q:"차를 발로 차면?",a:"카놀라유"},
  {q:"서울에 사는 거지는?",a:"설거지"},
  {q:"비가 1시간 동안 내리면?",a:"추적60분"},
  {q:"소가 노래하면?",a:"소송"},
  {q:"왕과 작별할 때 하는 말은?",a:"바이킹"},
  {q:"포도가 자기소개 할 때 하는 말은?",a:"포도당"},
  {q:"냉장고가 넘어지면?",a:"냉장고장"},
  {q:"혀가 거짓말을 하면?",a:"전혀아닙니다"},
  {q:"신하가 왕에게 공을 던질 때 하는 말?",a:"송구하옵니다전하"},
  {q:"할아버지가 등산하면?",a:"산타할아버지"},
  {q:"세상에서 가장 억울한 도형은?",a:"원통"},
  {q:"떡집 사장이 주식을 안 하는 이유?",a:"떡상할까봐"},
  {q:"유부남이 제일 무서워 하는 치킨은?",a:"마늘놀치킨"},
  {q:"세금을 내는 동물은?",a:"양도소득세"},
  {q:"이탈리아 날씨 어떨까?",a:"습하게띠"},
  {q:"모든 사람을 기상하게 하는 숫자?",a:"다섯"},
  {q:"직접 만든 총은?",a:"손수건"},
];

function mcToInput(q){return{...q,type:"input",display:String(q.a),a:String(q.a).toLowerCase().replace(/\s/g,"")};}

function genQ(uid,allInput){
  let q=null;
  if(uid===4){
    const n=ri(10,99),u=ri(2,9),r=ri(2,9),c=ri(2,9),bx=ri(2,9),pr=ri(10,30),x=ri(10,50),b2=ri(2,9);
    const pool=[{q:n+"×"+u+"=?",a:n*u,ch:sh([n*u,n*u+u,n*u-n,n+u])},{q:r+"행 "+c+"열로 의자를 놓으면\n의자는 모두 몇 개?",a:r*c,ch:sh([r*c,r*c+r,r*c-c,r+c])},{q:"한 상자에 "+pr+"개씩 "+bx+"상자이면\n모두 몇 개?",a:pr*bx,ch:sh([pr*bx,pr*bx+pr,pr*bx-pr,pr+bx])},{q:"□×"+b2+"="+x*b2+"\n□에 알맞은 수는?",a:x,ch:sh([x,x+1,x-1,x+b2])},{q:"계산 결과가 가장 큰 것은?",a:"28×3",ch:sh(["28×3","14×2","12×4","22×3"])}];
    const p=pool[ri(0,pool.length-1)];q={q:p.q,a:p.a,choices:p.ch,type:"mc"};
  } else if(uid===2){
    const s=ri(3,9),s2=ri(3,9),a2=ri(3,9),b2=ri(3,9);
    const pool=[{q:"시계가 3시를 가리킬 때\n시침과 분침이 이루는 각은?",a:"직각",ch:sh(["직각","예각","둔각","평각"])},{q:"직각삼각형에서\n직각은 몇 개일 수 있나요?",a:"1개",ch:sh(["1개","2개","3개","0개"])},{q:"네 각이 모두 직각이고\n네 변의 길이가 모두 같은 도형은?",a:"정사각형",ch:sh(["정사각형","직사각형","마름모","평행사변형"])},{q:"양쪽으로 끝없이 늘어나는\n곧은 선을 무엇이라 하나요?",a:"직선",ch:sh(["직선","선분","반직선","각"])},{q:"한쪽 방향으로만 끝없이\n늘어나는 선은?",a:"반직선",ch:sh(["반직선","직선","선분","각"])},{q:"두 점을 곧게 이은 선은?",a:"선분",ch:sh(["선분","직선","반직선","꼭짓점"])},{q:"정사각형은 직사각형이라\n할 수 있나요?",a:"할 수 있다",ch:sh(["할 수 있다","할 수 없다","모르겠다","경우에 따라"])},{q:"각의 꼭짓점은 몇 개인가요?",a:"1개",ch:sh(["1개","2개","3개","4개"])},{q:"색종이를 대각선으로 접어\n자르면 만들어지는 삼각형은?",a:"직각삼각형",ch:sh(["직각삼각형","정삼각형","둔각삼각형","이등변삼각형"])},{q:"직사각형에서 직각은\n모두 몇 개인가요?",a:"4개",ch:sh(["4개","2개","3개","1개"])},{q:"직각삼각형이 아닌 것은?",a:"세 각이 모두 예각인 삼각형",ch:sh(["세 각이 모두 예각인 삼각형","한 각이 직각인 삼각형","두 변이 같고 한 각이 직각","직각이 1개인 삼각형"])},{q:"직사각형 가로 "+s+"cm일 때\n마주보는 가로 변의 길이는?",a:s+"cm",ch:sh([s+"cm",(s+1)+"cm",(s*2)+"cm",(s-1)+"cm"])},{q:"정사각형의 한 변이 "+s2+"cm일 때\n다른 세 변의 길이는 각각?",a:s2+"cm",ch:sh([s2+"cm",(s2*2)+"cm",(s2+1)+"cm",(s2-1)+"cm"])},{q:"직사각형의 가로 "+a2+"cm,\n세로 "+b2+"cm일 때\n네 변의 길이의 합은?",a:2*(a2+b2)+"cm",ch:sh([2*(a2+b2)+"cm",(a2+b2)+"cm",(a2*b2)+"cm",(2*a2+b2)+"cm"])}];
    const p=pool[ri(0,pool.length-1)];q={q:p.q,a:p.a,choices:p.ch,type:"mc"};
  } else if(uid===3){
    const d=ri(2,9),q2=ri(2,9);
    const pool=[{q:d*q2+"개를 "+d+"개씩 묶으면\n몇 묶음인가요?",a:q2+"묶음",ch:sh([q2+"묶음",(q2+1)+"묶음",(q2-1)+"묶음",d+"묶음"])},{q:d*q2+"÷"+d+"=?",a:""+q2,ch:sh([""+q2,""+(q2+1),""+d,""+(q2-1)])},{q:"□÷"+d+"="+q2+"\n□에 알맞은 수는?",a:""+d*q2,ch:sh([""+d*q2,""+(d*q2+d),""+(d+q2),""+(d*q2-d)])},{q:d*q2+"÷□="+q2+"\n□에 알맞은 수는?",a:""+d,ch:sh([""+d,""+(d+1),""+q2,""+(d-1)])},{q:"곱셈식 "+d+"×"+q2+"="+d*q2+"를 이용하여\n"+d*q2+"÷"+d+"=?",a:""+q2,ch:sh([""+q2,""+(q2+1),""+d,""+(q2-1)])},{q:"동화책 "+d*q2+"권을 한 칸에\n"+d+"권씩 꽂으면 몇 칸?",a:q2+"칸",ch:sh([q2+"칸",(q2+1)+"칸",d+"칸",(q2-1)+"칸"])}];
    const p=pool[ri(0,pool.length-1)];q={q:p.q,a:p.a,choices:p.ch,type:"mc"};
  } else if(uid===1){
    const a=ri(100,999),b=ri(100,999),pool=[];
    if(Math.random()>.5){const aS=String(a).padStart(3," "),bS=String(b).padStart(3," ");pool.push({q:"  "+aS+"\n+ "+bS+"\n──────\n    ?",a:a+b,ch:sh([a+b,a+b+1,a+b-1,a+b+10])});}
    else{const big=Math.max(a,b),sm=Math.min(a,b);pool.push({q:"  "+String(big).padStart(3," ")+"\n- "+String(sm).padStart(3," ")+"\n──────\n    ?",a:big-sm,ch:sh([big-sm,big-sm+1,big-sm-1,big-sm+10])});}
    const a2=ri(100,500),b2=ri(100,a2);pool.push({q:"도서관에 책이 "+a2+"권 있었는데\n"+b2+"권을 빌려줬습니다.\n남은 책은 몇 권?",a:a2-b2,ch:sh([a2-b2,a2-b2+1,a2-b2-1,a2+b2])});
    const tot=ri(400,900),sub=ri(100,tot-100);pool.push({q:"어떤 수에서 "+sub+"를 빼면\n"+(tot-sub)+"가 됩니다.\n어떤 수는?",a:tot,ch:sh([tot,tot+1,tot-1,tot+10])});
    const p=pool[ri(0,pool.length-1)];q={q:p.q,a:p.a,choices:p.ch,type:"mc"};
  } else if(uid===5){
    const cm=ri(1,9),mm=ri(1,9),h=ri(1,11),m=ri(1,59),km=ri(1,9),m2=ri(100,900);
    const h2=ri(1,6),min2=ri(10,50),dur=ri(30,90),endT=h2*60+min2+dur;
    const pool=[{q:cm+"cm "+mm+"mm = ?mm",a:cm*10+mm,ch:sh([cm*10+mm,cm*10+mm+1,cm*10,cm*10+mm+10])},{q:h+"시간 "+m+"분 = ?분",a:h*60+m,ch:sh([h*60+m,h*60+m+1,h*60,h*60+m+10])},{q:km+"km "+m2+"m = ?m",a:km*1000+m2,ch:sh([km*1000+m2,km*1000+m2+100,km*100+m2,km*1000])},{q:h2+"시 "+min2+"분에 출발해서\n"+dur+"분 후 도착.\n도착 시각은 몇 시?",a:Math.floor(endT/60),ch:sh([Math.floor(endT/60),Math.floor(endT/60)+1,h2,Math.floor(endT/60)-1])},{q:"2분 10초 = ?초",a:130,ch:sh([130,120,140,210])},{q:"7시 25분의 25분 전 시각은?",a:"7시 정각",ch:sh(["7시 정각","6시 35분","7시 25분","6시 55분"])}];
    const p=pool[ri(0,pool.length-1)];q={q:p.q,a:p.a,choices:p.ch,type:"mc"};
  } else if(uid===6){
    const den=ri(4,10),n1=ri(1,den-2),n2=ri(1,den-n1-1),den2=ri(4,10),n3=ri(2,den2-1),d3=ri(2,9),xv=ri(11,39);
    const a2v=ri(5,25),b2v=ri(5,25),sm=a2v+b2v,big=ri(3,9),smv=ri(2,big-1),den4=ri(3,8),n4=ri(1,den4-1);
    const pool=[{q:n1+"/"+den+" + "+n2+"/"+den+" = ?/"+den,a:n1+n2,ch:sh([n1+n2,n1+n2+1,n1,n2])},{q:n3+"/"+den2+"보다 1/"+den2+" 더 큰\n분수의 분자는?",a:n3+1,ch:sh([n3+1,n3,n3+2,den2])},{q:"분모가 "+d3+"인 진분수 중\n가장 큰 수의 분자는?",a:d3-1,ch:sh([d3-1,d3,d3+1,d3-2])},{q:(xv/10).toFixed(1)+"은 0.1이 몇 개?",a:xv,ch:sh([xv,xv+1,xv-1,xv+2])},{q:(a2v/10).toFixed(1)+" + "+(b2v/10).toFixed(1)+" = ?",a:sm/10,ch:sh([sm/10,(sm+1)/10,(sm-1)/10,(sm+2)/10])},{q:"0.1이 7개이면?",a:"0.7",ch:sh(["0.7","0.07","7","70"])},{q:"분수 5/10을 소수로 나타내면?",a:"0.5",ch:sh(["0.5","5","0.05","50"])},{q:"전체를 "+den4+"으로 나눈 것 중\n"+n4+"만큼 색칠한 분수는?",a:n4+"/"+den4,ch:sh([n4+"/"+den4,(n4+1)+"/"+den4,n4+"/"+(den4+1),den4+"/"+n4])}];
    const p=pool[ri(0,pool.length-1)];q={q:p.q,a:p.a,choices:p.ch,type:"mc"};
  } else {
    const p=sh([...NP])[0];
    return{q:p.q,a:p.a.toLowerCase().replace(/\s/g,""),type:"input",display:p.a};
  }
  return allInput?mcToInput(q):q;
}

function getMHP(si,mi,crazy){const base=mi===2?Math.min(12,4+si*2):mi+1+Math.floor(si/2);return crazy?base*2:base;}
function getBT(uid,crazy){return crazy?20:999;}

const HL=[{body:"#8B6914",helm:"#666",shield:null,cape:null},{body:"#1565C0",helm:"#78909C",shield:"#37474F",cape:null},{body:"#1565C0",helm:"#B0BEC5",shield:"#546E7A",cape:"#c62828"},{body:"#0D47A1",helm:"#CFD8DC",shield:"#78909C",cape:"#880E4F"},{body:"#4A148C",helm:"#FFD700",shield:"#FFB300",cape:"#880E4F"},{body:"#E8EAF6",helm:"#FFD700",shield:"#FFF176",cape:"#F8BBD9"},{body:"#4FC3F7",helm:"#E040FB",shield:"#FF4081",cape:"#7C4DFF"}];
function dPet(ctx,x,y,petId,f){
  const bob=Math.sin(f*0.22+1)*3;
  const hop=Math.abs(Math.sin(f*0.18))*5;
  ctx.save();
  ctx.translate(x,y+bob-hop);
  if(petId===0){// 슬라임
    ctx.fillStyle="#4caf50";
    ctx.beginPath();ctx.ellipse(0,2,10,8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#81c784";
    ctx.beginPath();ctx.ellipse(-2,-3,7,5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#1a1a1a";
    ctx.beginPath();ctx.arc(-3,-3,2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(3,-3,2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff";
    ctx.beginPath();ctx.arc(-2,-4,1,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(4,-4,1,0,Math.PI*2);ctx.fill();
  } else if(petId===1){// 요정
    ctx.fillStyle="#F48FB1";
    ctx.beginPath();ctx.ellipse(0,0,6,8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff";ctx.globalAlpha=0.7;
    const wing=Math.sin(f*0.3)*0.2;
    ctx.beginPath();ctx.ellipse(-10,-2,8,5,wing,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(10,-2,8,5,-wing,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
    ctx.fillStyle="#FFCC80";
    ctx.beginPath();ctx.arc(0,-7,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#1a1a1a";
    ctx.beginPath();ctx.arc(-2,-7,1.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(2,-7,1.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#FFD700";
    ctx.font="8px sans-serif";ctx.textAlign="center";
    ctx.fillText("✦",0,-14);
  } else if(petId===2){// 불꽃고양이
    ctx.fillStyle="#FF7043";
    ctx.beginPath();ctx.ellipse(0,2,9,7,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(-8,-5);ctx.lineTo(-12,-12);ctx.lineTo(-4,-7);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(8,-5);ctx.lineTo(12,-12);ctx.lineTo(4,-7);ctx.closePath();ctx.fill();
    ctx.fillStyle="#FFCC80";
    ctx.beginPath();ctx.ellipse(0,-3,6,5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#1a1a1a";
    ctx.beginPath();ctx.arc(-2,-4,1.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(2,-4,1.5,0,Math.PI*2);ctx.fill();
    const tailSwing=Math.sin(f*0.15)*18;
    ctx.strokeStyle="#FF7043";ctx.lineWidth=3;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(8,4);ctx.quadraticCurveTo(16,0+tailSwing,14,-6+tailSwing);ctx.stroke();
    ctx.fillStyle="#FF5722";
    ctx.font="9px sans-serif";ctx.textAlign="center";
    ctx.fillText("🔥",0,-12);
  } else if(petId===3){// 드래곤
    ctx.fillStyle="#7B1FA2";
    ctx.beginPath();ctx.ellipse(0,2,11,9,0,0,Math.PI*2);ctx.fill();
    const wf=Math.sin(f*0.2)*0.3;
    ctx.fillStyle="#CE93D8";ctx.globalAlpha=0.85;
    ctx.beginPath();ctx.moveTo(-4,-2);ctx.lineTo(-16,-10+wf*8);ctx.lineTo(-10,2);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(4,-2);ctx.lineTo(16,-10-wf*8);ctx.lineTo(10,2);ctx.closePath();ctx.fill();
    ctx.globalAlpha=1;
    ctx.fillStyle="#CE93D8";
    ctx.beginPath();ctx.ellipse(0,-4,7,6,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#FFD700";
    ctx.beginPath();ctx.arc(-2,-5,2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(2,-5,2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#1a1a1a";
    ctx.beginPath();ctx.arc(-2,-5,1,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(2,-5,1,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#FFD700";
    ctx.beginPath();ctx.moveTo(-3,-10);ctx.lineTo(-1,-14);ctx.lineTo(1,-10);ctx.fill();
    ctx.beginPath();ctx.moveTo(1,-10);ctx.lineTo(3,-14);ctx.lineTo(5,-10);ctx.fill();
  }
  ctx.restore();
}

function dHero(ctx,x,y,look,f,ji){const bob=Math.sin(f*0.18)*2,lL=Math.sin(f*0.18)*6,lR=-lL;ctx.save();ctx.translate(x,y+bob);ctx.fillStyle="#1a1a1a";ctx.fillRect(-5,14+lL,4,10);ctx.fillRect(2,14+lR,4,10);ctx.fillStyle="#3E2723";ctx.fillRect(-6,22+lL,6,4);ctx.fillRect(1,22+lR,6,4);if(look.cape){ctx.fillStyle=look.cape;ctx.beginPath();ctx.moveTo(-6,2);ctx.lineTo(-14,16+lL);ctx.lineTo(-6,14);ctx.closePath();ctx.fill();}ctx.fillStyle=look.body;ctx.fillRect(-7,2,14,14);if(look.shield){ctx.fillStyle=look.shield;ctx.fillRect(6,4,5,8);ctx.fillStyle="#FFD700";ctx.fillRect(7,7,3,2);}ctx.fillStyle="#CFD8DC";ctx.fillRect(-12,4,2,12);ctx.fillStyle="#8D6E63";ctx.fillRect(-13,10,4,2);ctx.fillStyle="#FFCC80";ctx.fillRect(-5,-9,10,10);ctx.fillStyle="#1a1a1a";ctx.fillRect(-3,-6,2,2);ctx.fillRect(1,-6,2,2);ctx.fillStyle=look.helm;ctx.fillRect(-6,-12,12,6);if(look.helm==="#FFD700"){ctx.fillStyle="#FFF176";ctx.fillRect(-4,-15,8,4);}if(ji){ctx.font="11px sans-serif";ctx.textAlign="center";ctx.fillText(ji,0,-24);}ctx.restore();}
function dMon(ctx,x,y,mi,color,f,shake,hpR){const bob=Math.sin(f*0.12)*3,sx=shake?Math.sin(f*0.8)*6:0,iB=mi===2;ctx.save();ctx.translate(x+sx,y+bob);ctx.fillStyle=color;if(iB){ctx.fillRect(-16,-20,32,32);ctx.fillStyle="#FFD700";ctx.fillRect(-18,-24,36,8);ctx.fillStyle="#1a1a1a";ctx.fillRect(-9,-16,7,7);ctx.fillRect(3,-16,7,7);ctx.fillStyle="#fff";ctx.fillRect(-7,0,14,6);ctx.fillStyle=color;ctx.globalAlpha=0.4;ctx.beginPath();ctx.ellipse(0,16,20,7,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}else{ctx.fillRect(-10,-16,20,22);ctx.fillStyle="#FFCC80";ctx.fillRect(-7,-24,14,10);ctx.fillStyle="#1a1a1a";ctx.fillRect(-5,-20,4,4);ctx.fillRect(2,-20,4,4);ctx.fillStyle="#fff";ctx.fillRect(-6,-14,4,4);ctx.fillRect(2,-14,4,4);ctx.fillStyle=color;const arm=Math.sin(f*0.12)*8;ctx.fillRect(-18,-8+arm,8,12);ctx.fillRect(10,-8-arm,8,12);}const bw=iB?44:28;ctx.fillStyle="#222";ctx.fillRect(-bw/2,-30,bw,6);ctx.fillStyle=hpR>0.5?"#2ecc71":hpR>0.25?"#f39c12":"#e74c3c";ctx.fillRect(-bw/2,-30,bw*Math.max(0,hpR),6);ctx.strokeStyle="#000";ctx.lineWidth=0.5;ctx.strokeRect(-bw/2,-30,bw,6);ctx.lineWidth=1;ctx.restore();}
function dFx(ctx,ef){const p=ef.frame/ef.maxFrame;if(ef.type==="hit"){ctx.save();ctx.globalAlpha=Math.max(0,1-p*1.5);ctx.strokeStyle="#fff";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(ef.x-22+p*10,ef.y-22+p*5);ctx.lineTo(ef.x+22-p*5,ef.y+16-p*10);ctx.stroke();ctx.strokeStyle="#FFD700";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ef.x-16,ef.y-16);ctx.lineTo(ef.x+16,ef.y+10);ctx.stroke();["#FFD700","#FF6B6B","#fff"].forEach((c,i)=>{const ang=(i/3)*Math.PI*2+p,dist=22*p;ctx.fillStyle=c;ctx.globalAlpha=Math.max(0,1-p*2);ctx.beginPath();ctx.arc(ef.x+Math.cos(ang)*dist,ef.y+Math.sin(ang)*dist,Math.max(0,4-p*3),0,Math.PI*2);ctx.fill();});ctx.restore();}else if(ef.type==="miss"){ctx.save();ctx.globalAlpha=Math.max(0,1-p);ctx.fillStyle="#ff6b6b";ctx.font="bold 14px "+PF;ctx.textAlign="center";ctx.fillText("MISS!",ef.x,ef.y-34*p);ctx.restore();}else if(ef.type==="kill"){const cols=["#FFD700","#FF6B6B","#FF8C00","#fff","#FFA500"];for(let i=0;i<24;i++){const ang=(i/24)*Math.PI*2,dist=70*p;ctx.save();ctx.globalAlpha=Math.max(0,1-p);ctx.fillStyle=cols[i%5];ctx.beginPath();ctx.arc(ef.x+Math.cos(ang)*dist,ef.y+Math.sin(ang)*dist,Math.max(0,7-p*9),0,Math.PI*2);ctx.fill();ctx.restore();}for(let i=0;i<10;i++){const ang=(i/10)*Math.PI*2+p,dist=48*p;ctx.save();ctx.globalAlpha=Math.max(0,1-p*1.2);ctx.fillStyle="#FFD700";ctx.font=(16-p*9)+"px sans-serif";ctx.textAlign="center";ctx.fillText("★",ef.x+Math.cos(ang)*dist,ef.y+Math.sin(ang)*dist);ctx.restore();}ctx.save();ctx.globalAlpha=Math.max(0,1-p*0.8);ctx.fillStyle="#FFD700";ctx.font="bold "+(12+p*5)+"px "+PF;ctx.textAlign="center";ctx.shadowColor="#FF6B6B";ctx.shadowBlur=14;ctx.fillText("DEFEAT!",ef.x,ef.y-44*p);ctx.shadowBlur=0;ctx.restore();}else if(ef.type==="dmg"){ctx.save();ctx.globalAlpha=Math.max(0,1-p);ctx.fillStyle="#FF4081";ctx.font="bold 13px "+PF;ctx.textAlign="center";ctx.fillText(ef.label||"-1",ef.x+ri(-8,8),ef.y-24*p);ctx.restore();}else if(ef.type==="coin"){ctx.save();ctx.globalAlpha=Math.max(0,1-p);ctx.fillStyle="#FFD700";ctx.font="bold 11px "+PF;ctx.textAlign="center";ctx.fillText(ef.label,ef.x,ef.y-30*p);ctx.restore();}else if(ef.type==="combo"){ctx.save();ctx.globalAlpha=Math.max(0,1-p*0.8);ctx.fillStyle="#FF8C00";ctx.font="bold "+(10+ef.count*2)+"px "+PF;ctx.textAlign="center";ctx.shadowColor="#FFD700";ctx.shadowBlur=12;ctx.fillText(ef.count+"콤보!",ef.x,ef.y-36*p);ctx.shadowBlur=0;ctx.restore();}}
function dBg(ctx,si,W,H,sx){const s=STAGES[si];const g=ctx.createLinearGradient(0,0,0,H*0.65);g.addColorStop(0,s.bg[0]);g.addColorStop(1,s.bg[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H*0.65);ctx.fillStyle=s.bg[2];ctx.fillRect(0,H*0.65,W,H*0.35);ctx.fillStyle=s.ground;ctx.fillRect(0,H*0.72,W,H*0.28);const ox=(sx*0.3)%W;if(si===0){for(let i=-1;i<4;i++){const tx=(i*200-ox+W*2)%(W+200)-60;ctx.fillStyle="#2E7D32";ctx.beginPath();ctx.moveTo(tx,H*0.65);ctx.lineTo(tx+32,H*0.33);ctx.lineTo(tx+64,H*0.65);ctx.fill();ctx.fillStyle="#5D4037";ctx.fillRect(tx+28,H*0.65-22,8,22);}}else if(si===1){for(let i=-1;i<5;i++){const tx=(i*150-ox+W*2)%(W+220)-80;ctx.fillStyle="#1B5E20";ctx.fillRect(tx+20,H*0.18,8,H*0.47);ctx.fillStyle="#388E3C";for(let j=0;j<6;j++){ctx.beginPath();ctx.ellipse(tx+24+Math.cos(j*60*Math.PI/180)*24,H*0.22+Math.sin(j*60*Math.PI/180)*11,20,11,j*60*Math.PI/180,0,Math.PI*2);ctx.fill();}}}else if(si===2){ctx.fillStyle="#E1F5FE";for(let i=-1;i<6;i++){const tx=(i*130-ox+W*2)%(W+200)-80;ctx.beginPath();ctx.moveTo(tx,H*0.65);ctx.lineTo(tx+44,H*0.48);ctx.lineTo(tx+88,H*0.65);ctx.fill();}}else if(si===3){for(let i=-1;i<5;i++){const tx=(i*110-ox+W*2)%(W+200)-80;const hh=34+Math.sin(i)*22;ctx.fillStyle="#b71c1c";ctx.beginPath();ctx.moveTo(tx,H*0.72);ctx.lineTo(tx+22,H*0.72-hh);ctx.lineTo(tx+44,H*0.72);ctx.fill();ctx.fillStyle="#FF6D00";ctx.globalAlpha=0.7;ctx.beginPath();ctx.moveTo(tx+6,H*0.72-hh+6);ctx.lineTo(tx+22,H*0.72-hh-12);ctx.lineTo(tx+38,H*0.72-hh+6);ctx.fill();ctx.globalAlpha=1;}}else if(si===4){ctx.fillStyle="rgba(255,255,255,0.75)";for(let i=-1;i<5;i++){const tx=(i*170-ox*0.4+W*2)%(W+220)-80;ctx.beginPath();ctx.arc(tx+44,H*0.44,34,Math.PI,0);ctx.arc(tx+70,H*0.44,22,Math.PI,0);ctx.arc(tx+22,H*0.44,24,Math.PI,0);ctx.closePath();ctx.fill();}ctx.strokeStyle="#FFD700";ctx.lineWidth=2;for(let i=0;i<3;i++){const tx=(i*210-ox*0.2+W*2)%(W+220)-80;ctx.beginPath();ctx.ellipse(tx,H*0.54,16,6,0,0,Math.PI*2);ctx.stroke();}ctx.lineWidth=1;}else if(si===5){ctx.fillStyle="#fff";for(let i=0;i<32;i++){const x2=(i*75-ox*0.1+W*3)%(W+20)-10;const y2=(i*49)%(H*0.65);ctx.beginPath();ctx.arc(x2,y2,i%5===0?2:1,0,Math.PI*2);ctx.fill();}ctx.fillStyle="#7E57C2";ctx.beginPath();ctx.arc((W*0.78-ox*0.05+W*10)%(W+110)-20,H*0.2,38,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#4FC3F7";ctx.lineWidth=5;ctx.beginPath();ctx.ellipse((W*0.78-ox*0.05+W*10)%(W+110)-20,H*0.2,58,17,0.3,0,Math.PI*2);ctx.stroke();ctx.lineWidth=1;}else if(si===6){ctx.fillStyle="#fff";for(let i=0;i<40;i++){const x2=(i*55-ox*0.05+W*3)%(W+20)-10;const y2=(i*33)%(H*0.65);ctx.beginPath();ctx.arc(x2,y2,i%5===0?3:1,0,Math.PI*2);ctx.fill();}ctx.fillStyle="#E040FB";ctx.beginPath();ctx.arc(W*0.28,H*0.24,22,0,Math.PI*2);ctx.fill();}}

function RouletteScreen({slot,job,currentGrade,onResult}){
  const[dg,setDg]=useState(0),[final,setFinal]=useState(null);
  const isUp=currentGrade!=null;
  useEffect(()=>{
    const result=isUp?Math.min(4,currentGrade+1):rollGrade();
    let speed=55,count=0,max=26+ri(0,14);
    const tick=()=>{count++;setDg(g=>(g+1)%5);SFX.roul();if(count>max*0.6)speed=Math.min(speed+22,520);if(count>=max){setDg(result);setFinal(result);SFX.roulEnd();setTimeout(()=>onResult(result),1800);return;}setTimeout(tick,speed);};
    setTimeout(tick,speed);
  },[]);
  const gc=GC[dg];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:100,fontFamily:PF}}>
      <div style={{fontSize:"10px",color:"#ffd700",marginBottom:"8px",letterSpacing:"3px"}}>{isUp?"✦ 장비 업그레이드! ✦":"✦ 아이템 룰렛 ✦"}</div>
      <div style={{display:"flex",gap:"5px",marginBottom:"20px",flexWrap:"wrap",justifyContent:"center"}}>
        {GN.map((g,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"3px"}}>
            <div style={{padding:"4px 7px",border:"2px solid "+(dg===i?GC[i]:"#333"),background:dg===i?GC[i]+"33":"transparent",fontSize:"7px",color:dg===i?GC[i]:"#555",boxShadow:dg===i?"0 0 12px "+GC[i]:"none",minWidth:"40px",textAlign:"center"}}>{g}</div>
            <div style={{fontSize:"6px",color:dg===i?GC[i]:"#444"}}>{GP[i]}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:"76px",textAlign:"center",filter:"drop-shadow(0 0 22px "+gc+")",marginBottom:"14px"}}>{job.di[slot]}</div>
      <div style={{fontSize:"14px",color:gc,marginBottom:"8px",textShadow:"0 0 14px "+gc,textAlign:"center"}}>{job.dn[slot][dg]}</div>
      <div style={{fontSize:"8px",color:"#a29bfe",marginBottom:"20px"}}>{final!=null?"✅ 획득!":"돌리는 중..."}</div>
      <div style={{border:"3px solid "+gc,padding:"7px 22px",boxShadow:"0 0 16px "+gc}}><div style={{fontSize:"9px",color:gc}}>{GN[dg]+" 등급"+(final!=null?" 획득!":"")}</div></div>
    </div>
  );
}

function DramaticPopup({type,item,onClose}){
  const[fr,setFr]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setFr(f=>f+1),30);const a=setTimeout(onClose,type==="item"?3000:2200);return()=>{clearInterval(t);clearTimeout(a);};},[]); // eslint-disable-line
  const pulse=1+Math.sin(fr*0.14)*0.07;
  if(type==="revive"){
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:100,fontFamily:PF}}>
        {Array.from({length:12}).map((_,i)=>{const ang=(i/12)*Math.PI*2+(fr*0.03);return <div key={i} style={{position:"absolute",left:"calc(50% + "+Math.cos(ang)*90+"px)",top:"calc(50% + "+Math.sin(ang)*90+"px)",fontSize:"18px",opacity:0.7+Math.sin(fr*0.1+i)*0.3}}>✨</div>;})}
        <div style={{fontSize:"48px",marginBottom:"12px",transform:"scale("+pulse+")",filter:"drop-shadow(0 0 20px #FFD700)"}}>👼</div>
        <div style={{fontSize:"14px",color:"#FFD700",textShadow:"0 0 20px #FFD700",marginBottom:"8px"}}>부활!</div>
        <div style={{fontSize:"10px",color:"#fff",marginBottom:"6px"}}>{item?item.name:"갑옷"}이(가) 부활시켰다!</div>
        <div style={{fontSize:"10px",color:"#2ecc71"}}>HP 2 회복!</div>
      </div>
    );
  }
  const gc=item?GC[item.grade]:"#FFD700";
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:100,fontFamily:PF}}>
      {Array.from({length:14}).map((_,i)=>{const ang=(i/14)*Math.PI*2+(fr*0.02),dist=80+Math.sin(fr*0.05+i)*20;return <div key={i} style={{position:"absolute",left:"calc(50% + "+Math.cos(ang)*dist+"px)",top:"calc(45% + "+Math.sin(ang)*dist+"px)",fontSize:(8+i%3*4)+"px",opacity:0.6+Math.sin(fr*0.1+i)*0.4,color:gc}}>★</div>;})}
      <div style={{position:"absolute",width:"280px",height:"280px",borderRadius:"50%",background:"radial-gradient(circle, "+gc+"22 0%, transparent 70%)"}}/>
      <div style={{fontSize:"9px",color:gc,marginBottom:"10px",textShadow:"0 0 10px "+gc,letterSpacing:"3px"}}>{"✦ "+GN[item?item.grade:0]+" 아이템 ✦"}</div>
      <div style={{fontSize:"64px",marginBottom:"12px",transform:"scale("+pulse+")",filter:"drop-shadow(0 0 20px "+gc+")"}}>{item?item.icon:"🎁"}</div>
      <div style={{fontSize:"15px",color:gc,marginBottom:"8px",textShadow:"0 0 16px "+gc,transform:"scale("+pulse+")"}}>{item?item.name:""}</div>
      <div style={{fontSize:"9px",color:"#dfe6e9",marginBottom:"20px",textAlign:"center",lineHeight:1.8}}>{item?item.effect:""}</div>
      <button onClick={onClose} style={{background:gc,border:"3px solid #000",boxShadow:"4px 4px 0 #000",color:"#000",fontFamily:PF,fontSize:"9px",padding:"9px 26px",cursor:"pointer"}}>확인!</button>
    </div>
  );
}

// 등급별 정가 구매
const ITEM_TIERS=[
  {grade:0,cost:100,label:"일반",color:GC[0]},
  {grade:1,cost:200,label:"고급",color:GC[1]},
  {grade:2,cost:300,label:"희귀",color:GC[2]},
  {grade:3,cost:400,label:"전설",color:GC[3]},
  {grade:4,cost:500,label:"슈퍼전설",color:GC[4]},
];

function ShopScreen({gold,setGold,player,setPlayer,equip,setEquip,job,pet,setPet,answerTickets,setAnswerTickets,onClose}){
  const[msg,setMsg]=useState("");
  const[selSlot,setSelSlot]=useState(null);
  const showMsg=(m)=>{setMsg(m);setTimeout(()=>setMsg(""),2200);};

  const efx=[
    ["보스 배율 x1","보스 배율 x1.5","보스 배율 x2","보스 배율 x3","보스 배율 x5"],
    ["방패 차단 1회","방패 차단 2회","방패 차단 3회","방패 차단 5회","방패 차단 무제한"],
    ["부활 1회","부활 1회","부활 1회","부활 1회","부활 2회"],
    ["콤보보너스 x1.5","콤보보너스 x2","콤보보너스 x2.5","콤보보너스 x3","콤보보너스 x5"],
    ["시간+5초","시간+10초","시간+15초","시간+20초","시간+30초"],
    ["점수+50","점수+100","점수+200","점수+500","점수+1000"],
  ];

  const buyItem=(grade,cost)=>{
    if(gold<cost){showMsg("골드가 부족해요!");return;}
    if(selSlot===null){showMsg("슬롯을 먼저 선택하세요!");return;}
    const item={grade,name:job.dn[selSlot][grade],icon:job.di[selSlot],effect:efx[selSlot][grade],slot:selSlot};
    setEquip(eq=>{const n=[...eq];n[selSlot]=item;return n;});
    setGold(g=>g-cost);
    SFX.itemGet();
    showMsg(GN[grade]+" "+item.icon+" "+item.name+" 획득!");
  };

  const baseItems=[
    {id:"hp",icon:"❤️",name:"HP +1 회복",desc:"HP를 1 회복",cost:30,action:()=>{
      if(player.hp>=player.maxHp){showMsg("이미 HP가 최대예요!");return false;}
      setPlayer(p=>({...p,hp:Math.min(p.maxHp,p.hp+1)}));showMsg("❤️ HP +1 회복!");return true;
    }},
    {id:"hp2",icon:"💖",name:"HP +2 회복",desc:"HP를 2 회복",cost:50,action:()=>{
      if(player.hp>=player.maxHp){showMsg("이미 HP가 최대예요!");return false;}
      setPlayer(p=>({...p,hp:Math.min(p.maxHp,p.hp+2)}));showMsg("💖 HP +2 회복!");return true;
    }},
    {id:"ans",icon:"💡",name:"정답표시권",desc:"배틀 중 정답을 강조 표시 (1회)",cost:50,action:()=>{
      setAnswerTickets(t=>t+1);showMsg("💡 정답표시권 획득! ("+(answerTickets+1)+"장 보유)");return true;
    }},
  ];

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",zIndex:50,fontFamily:PF,padding:"14px",boxSizing:"border-box",overflowY:"auto"}}>
      <div style={{fontSize:"12px",color:"#FFD700",marginBottom:"2px",textShadow:"0 0 10px #FFD700"}}>🏪 상점</div>
      <div style={{fontSize:"9px",color:"#ffd700",marginBottom:"10px"}}>🪙 보유 골드: {gold}G {answerTickets>0&&<span style={{color:"#a29bfe"}}>| 💡정답권 {answerTickets}장</span>}</div>

      {/* 기본 아이템 */}
      <div style={{display:"flex",flexDirection:"column",gap:"7px",width:"100%",maxWidth:"340px",marginBottom:"10px"}}>
        {baseItems.map(it=>(
          <div key={it.id} style={{background:"#16213e",border:"2px solid #2c2c54",padding:"9px 12px",display:"flex",alignItems:"center",gap:"10px",borderRadius:"4px"}}>
            <div style={{fontSize:"20px"}}>{it.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:"8px",color:"#fff",marginBottom:"2px"}}>{it.name}</div>
              <div style={{fontSize:"6px",color:"#a29bfe"}}>{it.desc}</div>
            </div>
            <button onClick={()=>{if(gold<it.cost){showMsg("골드가 부족해요!");return;}if(it.action()){setGold(g=>g-it.cost);SFX.buy();}}}
              style={{background:gold>=it.cost?"#e17055":"#444",border:"2px solid #000",color:"#fff",fontFamily:PF,fontSize:"7px",padding:"6px 8px",cursor:gold>=it.cost?"pointer":"not-allowed",borderRadius:"3px",minWidth:"52px",textAlign:"center"}}>
              {it.cost}G<br/>구매
            </button>
          </div>
        ))}
      </div>

      {/* 아이템 직접 구매 */}
      <div style={{width:"100%",maxWidth:"340px",background:"#0d1117",border:"2px solid #FFD700",borderRadius:"6px",padding:"10px",marginBottom:"10px"}}>
        <div style={{fontSize:"8px",color:"#FFD700",marginBottom:"8px"}}>🛒 장비 직접 구매 <span style={{color:"#636e72",fontSize:"6px"}}>(슬롯 → 등급 → 아이템 선택)</span></div>

        {/* STEP 1: 슬롯 선택 */}
        <div style={{marginBottom:"10px"}}>
          <div style={{fontSize:"6px",color:"#a29bfe",marginBottom:"5px"}}>① 장비 슬롯 선택</div>
          <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>
            {job.di.map((ic,i)=>{
              const cur=equip[i];
              const gc=cur?GC[cur.grade]:"#444";
              const isSel=selSlot===i;
              return(
                <button key={i} onClick={()=>setSelSlot(isSel?null:i)}
                  style={{background:isSel?"#2a1a4e":"#111",border:"2px solid "+(isSel?"#a855f7":gc),borderRadius:"4px",padding:"5px 7px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",boxShadow:isSel?"0 0 8px #a855f7":"none",minWidth:"36px"}}>
                  <span style={{fontSize:"16px"}}>{ic}</span>
                  <span style={{fontSize:"5px",color:cur?gc:"#444",fontFamily:PF}}>{cur?GN[cur.grade]:"없음"}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: 등급+아이템 목록 */}
        {selSlot!==null ? (
          <div>
            <div style={{fontSize:"6px",color:"#a29bfe",marginBottom:"6px"}}>② 구매할 아이템 선택 <span style={{color:"#636e72"}}>({job.di[selSlot]} 슬롯)</span></div>
            <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
              {ITEM_TIERS.map(tier=>{
                const itemName=job.dn[selSlot][tier.grade];
                const itemEffect=efx[selSlot][tier.grade];
                const canBuy=gold>=tier.cost;
                const cur=equip[selSlot];
                const isOwned=cur&&cur.grade===tier.grade;
                return(
                  <div key={tier.grade} style={{display:"flex",alignItems:"center",gap:"8px",background:isOwned?"#1a2a0a":"#0a0a1a",border:"2px solid "+(isOwned?tier.color:tier.color+"55"),borderRadius:"4px",padding:"7px 9px"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",minWidth:"14px"}}>
                      <div style={{width:"10px",height:"10px",borderRadius:"50%",background:tier.color,boxShadow:"0 0 5px "+tier.color}}/>
                      {isOwned&&<div style={{fontSize:"5px",color:tier.color}}>보유</div>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:"4px",marginBottom:"2px"}}>
                        <span style={{fontSize:"6px",color:tier.color,fontFamily:PF}}>{tier.label}</span>
                        <span style={{fontSize:"7px",color:"#fff"}}>{job.di[selSlot]} {itemName}</span>
                      </div>
                      <div style={{fontSize:"6px",color:"#a29bfe"}}>{itemEffect}</div>
                    </div>
                    <button onClick={()=>buyItem(tier.grade,tier.cost)} disabled={!canBuy}
                      style={{background:canBuy?tier.color+"cc":"#222",border:"2px solid "+(canBuy?tier.color:"#333"),color:canBuy?"#000":"#555",fontFamily:PF,fontSize:"6px",padding:"5px 7px",cursor:canBuy?"pointer":"not-allowed",borderRadius:"3px",minWidth:"50px",textAlign:"center",fontWeight:"bold"}}>
                      {tier.cost}G<br/>{canBuy?"구매":"부족"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ):(
          <div style={{fontSize:"6px",color:"#555",textAlign:"center",padding:"10px 0"}}>슬롯을 선택하면 구매 가능한 아이템 목록이 표시됩니다</div>
        )}
      </div>

      {/* 펫 상점 */}
      <div style={{width:"100%",maxWidth:"340px",background:"#0d1117",border:"2px solid #7C4DFF",borderRadius:"6px",padding:"10px",marginBottom:"10px"}}>
        <div style={{fontSize:"8px",color:"#a29bfe",marginBottom:"8px"}}>🐾 펫 상점</div>
        {pet
          ? <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{fontSize:"28px"}}>{PETS[pet.id].emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:"8px",color:"#FFD700",marginBottom:"2px"}}>{PETS[pet.id].name}</div>
                <div style={{fontSize:"7px",color:"#2ecc71"}}>힌트 남은 횟수: {pet.hintsLeft}회</div>
              </div>
              <div style={{fontSize:"7px",color:"#a29bfe",background:"#1a1a3e",padding:"3px 7px",borderRadius:"3px"}}>{GN[PETS[pet.id].grade]}</div>
            </div>
          : <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"}}>
              {PETS.map(p=>(
                <button key={p.id} onClick={()=>{if(gold<p.cost){showMsg("골드가 부족해요! ("+p.cost+"G 필요)");return;}setPet({id:p.id,hintsLeft:p.hintCount});setGold(g=>g-p.cost);SFX.itemGet();showMsg(p.emoji+" "+p.name+" 입양!");}}
                  style={{background:gold>=p.cost?"#16213e":"#111",border:"2px solid "+(gold>=p.cost?GC[p.grade]:"#333"),padding:"8px 6px",cursor:gold>=p.cost?"pointer":"not-allowed",borderRadius:"4px",display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",opacity:gold>=p.cost?1:0.5}}>
                  <div style={{fontSize:"20px"}}>{p.emoji}</div>
                  <div style={{fontSize:"6px",color:GC[p.grade],fontFamily:PF}}>{p.name}</div>
                  <div style={{fontSize:"6px",color:"#a29bfe",fontFamily:PF}}>{p.desc}</div>
                  <div style={{fontSize:"7px",color:"#FFD700",fontFamily:PF}}>{p.cost}G</div>
                </button>
              ))}
            </div>
        }
      </div>

      {msg&&<div style={{fontSize:"8px",color:"#FFD700",marginBottom:"8px",background:"rgba(0,0,0,0.8)",padding:"6px 14px",borderRadius:"4px",border:"1px solid #FFD70066",textAlign:"center"}}>{msg}</div>}
      <button onClick={onClose} style={{background:"#27ae60",border:"3px solid #000",boxShadow:"3px 3px 0 #000",color:"#fff",fontFamily:PF,fontSize:"9px",padding:"10px 24px",cursor:"pointer",borderRadius:"3px"}}>▶ 다음 스테이지</button>
    </div>
  );
}

// ★ 장비 HUD: 게임 화면 하단에 등급 색상 테두리 + 이름 툴팁 표시
function EquipHUD({equip,job,onOpenEquip}){
  const[hov,setHov]=useState(null);
  if(!job)return null;
  return(
    <div style={{position:"absolute",bottom:"6px",left:"6px",display:"flex",gap:"4px",alignItems:"flex-end",zIndex:5}}>
      {job.di.map((ic,i)=>{
        const item=equip[i];
        const gc=item?GC[item.grade]:"#333";
        const isHov=hov===i;
        return(
          <div key={i} style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center"}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
            {isHov&&item&&(
              <div style={{position:"absolute",bottom:"36px",left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.95)",border:"2px solid "+gc,padding:"5px 8px",borderRadius:"4px",whiteSpace:"nowrap",zIndex:20,minWidth:"80px",textAlign:"center",pointerEvents:"none"}}>
                <div style={{fontSize:"7px",color:gc,fontFamily:PF,marginBottom:"2px"}}>{GN[item.grade]}</div>
                <div style={{fontSize:"6px",color:"#fff",fontFamily:PF,marginBottom:"2px"}}>{item.name}</div>
                <div style={{fontSize:"6px",color:"#a29bfe",fontFamily:PF}}>{item.effect}</div>
              </div>
            )}
            {isHov&&!item&&(
              <div style={{position:"absolute",bottom:"36px",left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.9)",border:"2px solid #333",padding:"4px 7px",borderRadius:"4px",whiteSpace:"nowrap",zIndex:20,pointerEvents:"none"}}>
                <div style={{fontSize:"6px",color:"#555",fontFamily:PF}}>미획득</div>
              </div>
            )}
            <div onClick={onOpenEquip} style={{
              width:"26px",height:"26px",
              border:"2px solid "+gc,
              borderRadius:"4px",
              background:item?"rgba(0,0,0,0.7)":"rgba(0,0,0,0.4)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"14px",
              opacity:item?1:0.3,
              cursor:"pointer",
              boxShadow:item?"0 0 6px "+gc+", inset 0 0 4px "+gc+"44":"none",
              position:"relative",
            }}>
              {ic}
              {item&&(
                <div style={{
                  position:"absolute",bottom:"-5px",right:"-4px",
                  width:"8px",height:"8px",
                  background:gc,
                  borderRadius:"50%",
                  border:"1px solid #000",
                  boxShadow:"0 0 4px "+gc,
                }}/>
              )}
            </div>
          </div>
        );
      })}
      <div onClick={onOpenEquip} style={{width:"26px",height:"20px",background:"rgba(255,255,255,0.12)",border:"1px solid #555",borderRadius:"3px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:"6px",color:"#aaa",fontFamily:PF}}>장비</div>
    </div>
  );
}

function BattleModal({q,onAnswer,si,monName,isBoss,combo,comboMsg,timer,baseTime,frozen,inputVal,setInputVal,onSubmit,mHP,mMaxHP,answers,selected,unitName,gold,crazy,allInput,pet,onUseHint,hintUsed,answerTickets,ansTicketUsed,onUseAnsTicket,eliminatedChoice}){
  const s=STAGES[si];
  const cc=combo>=5?"#FF4081":combo>=3?"#FF8C00":"#FFD700";
  const showTimer=crazy;
  const tc=frozen?"#636e72":timer<=5?"#e74c3c":timer<=10?"#FF8C00":"#2ecc71";
  const hpR=mHP/mMaxHP,hpC=hpR>0.5?"#2ecc71":hpR>0.25?"#f39c12":"#e74c3c";
  const isInp=q&&q.type==="input";
  const petData=pet?PETS[pet.id]:null;
  const canHint=pet&&pet.hintsLeft>0&&!hintUsed;
  return(
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
      <div style={{background:"#0a0a2e",border:"4px solid "+(crazy?"#FF4081":s.accent),boxShadow:"8px 8px 0 #000",padding:"16px",width:"94%",maxWidth:"370px",fontFamily:PF,boxSizing:"border-box"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
          <div style={{fontSize:"9px",color:crazy?"#FF4081":s.accent}}>{isBoss?"👾 ":""}{monName}{crazy?" 😈":""}</div>
          <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
            {pet&&<div style={{fontSize:"14px"}} title={petData.name+` 힌트 ${pet.hintsLeft}회 남음`}>{petData.emoji}</div>}
            {allInput&&<div style={{fontSize:"6px",color:"#FF8C00",background:"#FF8C0022",padding:"2px 5px",borderRadius:"3px"}}>✏️주관식</div>}
            <div style={{fontSize:"7px",color:"#636e72",background:"#111",padding:"2px 6px",borderRadius:"3px"}}>{unitName}</div>
            <div style={{fontSize:"7px",color:"#ffd700"}}>🪙{gold}</div>
          </div>
        </div>
        <div style={{marginBottom:"10px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
            <div style={{fontSize:"7px",color:"#a29bfe"}}>몬스터 HP</div>
            <div style={{fontSize:"8px",color:hpC,fontWeight:"bold"}}>{mHP} / {mMaxHP}</div>
          </div>
          <div style={{background:"#111",border:"1px solid #333",height:"10px",borderRadius:"5px",overflow:"hidden"}}>
            <div style={{background:hpC,height:"100%",width:(Math.max(0,hpR)*100)+"%",borderRadius:"5px",transition:"width 0.35s",boxShadow:"0 0 8px "+hpC}}/>
          </div>
        </div>
        {showTimer&&(
          <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"10px"}}>
            <div style={{fontSize:"11px",color:frozen?"#555":tc,minWidth:"32px",fontWeight:"bold"}}>{frozen?"--":("⏱"+timer)}</div>
            <div style={{flex:1,background:"#111",border:"1px solid #333",height:"7px",borderRadius:"4px",overflow:"hidden"}}>
              <div style={{background:frozen?"#333":tc,height:"100%",width:frozen?"100%":(timer/baseTime*100)+"%",borderRadius:"4px",transition:"width 1s linear"}}/>
            </div>
            {combo>=2&&<div style={{fontSize:"9px",color:cc,whiteSpace:"nowrap"}}>{"🔥"+combo+"콤보"}</div>}
          </div>
        )}
        {!showTimer&&combo>=2&&(
          <div style={{textAlign:"right",fontSize:"9px",color:cc,marginBottom:"8px"}}>{"🔥"+combo+"콤보"}</div>
        )}
        <div style={{background:"#111827",border:"2px solid #6c5ce7",padding:"14px",marginBottom:"8px",textAlign:"center",fontSize:"14px",color:ansTicketUsed?"#2ecc71":"#ffd700",lineHeight:2.0,whiteSpace:"pre",fontFamily:"'Courier New',monospace",minHeight:"64px",borderRadius:"4px"}}>{q?q.q:"..."}</div>
        {/* 정답표시권 버튼 */}
        {answerTickets>0&&!ansTicketUsed&&(
          <div style={{marginBottom:"6px"}}>
            <button onClick={onUseAnsTicket} style={{width:"100%",background:"#1a2a0a",border:"2px solid #2ecc71",color:"#2ecc71",fontFamily:PF,fontSize:"7px",padding:"6px",cursor:"pointer",borderRadius:"3px",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
              <span>💡</span><span>정답표시권 사용 ({answerTickets}장 보유) — 정답이 초록색으로 표시됩니다</span>
            </button>
          </div>
        )}
        {ansTicketUsed&&<div style={{fontSize:"7px",color:"#2ecc71",textAlign:"center",marginBottom:"6px"}}>💡 정답표시 중!</div>}
        {pet&&(
          <div style={{marginBottom:"8px",display:"flex",alignItems:"center",gap:"8px"}}>
            <button onClick={onUseHint} disabled={!canHint} style={{flex:1,background:canHint?"#4a2060":"#222",border:"2px solid "+(canHint?"#7C4DFF":"#444"),color:canHint?"#E040FB":"#555",fontFamily:PF,fontSize:"7px",padding:"6px",cursor:canHint?"pointer":"not-allowed",borderRadius:"3px"}}>
              {petData.emoji} 힌트 사용 ({pet.hintsLeft}회 남음)
            </button>
            {hintUsed&&<div style={{fontSize:"7px",color:"#2ecc71"}}>💡 정답 표시!</div>}
          </div>
        )}
        {comboMsg&&<div style={{textAlign:"center",fontSize:"9px",color:cc,marginBottom:"8px",padding:"4px",background:"rgba(0,0,0,0.4)",borderRadius:"3px"}}>{comboMsg}</div>}
        {isInp?(
          <div style={{display:"flex",gap:"8px"}}>
            <input value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")onSubmit();}} placeholder="정답 입력..." style={{flex:1,background:"#16213e",border:"2px solid #6c5ce7",color:"#fff",fontFamily:PF,fontSize:"10px",padding:"10px",outline:"none",borderRadius:"3px"}} autoFocus/>
            <button onClick={onSubmit} style={{background:"#6c5ce7",border:"2px solid #4a4a9e",color:"#fff",fontFamily:PF,fontSize:"9px",padding:"10px 12px",cursor:"pointer",borderRadius:"3px"}}>확인</button>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
            {q&&q.choices&&q.choices.map((c,i)=>{
              const isElim=eliminatedChoice===c&&selected==null;
              let bg="#16213e",bc="#6c5ce7",bsh="3px 3px 0 #000";
              if(ansTicketUsed&&c===q.a){bg="#1a3a10";bc="#2ecc71";bsh="0 0 8px #2ecc71";}
              if(selected!=null){if(c===q.a){bg="#1a4731";bc="#2ecc71";bsh="none";}else if(c===selected){bg="#4a1010";bc="#e74c3c";bsh="none";}}
              if(isElim){bg="#0a0a0a";bc="#333";bsh="none";}
              return(
                <button key={i} onClick={()=>selected==null&&!isElim&&onAnswer(c)}
                  style={{background:bg,border:"3px solid "+bc,color:isElim?"#333":"#fff",fontFamily:PF,fontSize:"11px",padding:"11px 8px",cursor:(selected==null&&!isElim)?"pointer":"default",boxShadow:bsh,whiteSpace:"pre-wrap",borderRadius:"3px",lineHeight:1.5,opacity:isElim?0.35:1,position:"relative",textDecoration:isElim?"line-through":"none"}}>
                  {["①","②","③","④"][i]+" "+c}
                  {isElim&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",opacity:0.5}}>✕</div>}
                </button>
              );
            })}
          </div>
        )}
        <div style={{marginTop:"10px",display:"flex",justifyContent:"center",gap:"4px"}}>
          {answers.map((a,i)=><div key={i} style={{width:"16px",height:"6px",background:a.correct?"#2ecc71":"#e74c3c",borderRadius:"3px"}}/>)}
        </div>
      </div>
    </div>
  );
}

// ★ 장비창: 등급 뱃지 + 색상 강화, 효과 설명 추가
function EquipModal({equipment,job,onClose}){
  const gradeLabels=["●일반","●고급","●희귀","●전설","●슈퍼전설"];
  return(
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:20}}>
      <div style={{background:"#0a0a2e",border:"4px solid #FFD700",boxShadow:"6px 6px 0 #000",padding:"16px",width:"94%",maxWidth:"340px",fontFamily:PF,overflowY:"auto",maxHeight:"90vh",boxSizing:"border-box"}}>
        <div style={{fontSize:"10px",color:"#FFD700",textAlign:"center",marginBottom:"14px"}}>{job.icon+" "+job.name+"의 장비창"}</div>

        {/* 등급 범례 */}
        <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"12px",justifyContent:"center"}}>
          {GN.map((g,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"3px",background:GC[i]+"22",border:"1px solid "+GC[i],borderRadius:"3px",padding:"2px 5px"}}>
              <div style={{width:"7px",height:"7px",borderRadius:"50%",background:GC[i]}}/>
              <span style={{fontSize:"6px",color:GC[i]}}>{g}</span>
            </div>
          ))}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"14px"}}>
          {equipment.map((item,i)=>{
            const gc=item?GC[item.grade]:"#2c2c54";
            return(
              <div key={i} style={{background:item?"#0d1a0d":"#111",border:"2px solid "+gc,padding:"10px 12px",display:"flex",alignItems:"center",gap:"10px",borderRadius:"4px",boxShadow:item?"0 0 8px "+gc+"44":"none"}}>
                <div style={{fontSize:"20px",opacity:item?1:0.25,filter:item?"drop-shadow(0 0 4px "+gc+")":"none"}}>{item?item.icon:job.di[i]}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"3px"}}>
                    <span style={{fontSize:"8px",color:item?gc:"#636e72"}}>{item?item.name:"슬롯 "+(i+1)+" (미획득)"}</span>
                    {item&&(
                      <span style={{fontSize:"6px",color:gc,background:gc+"22",border:"1px solid "+gc,padding:"1px 4px",borderRadius:"2px",whiteSpace:"nowrap"}}>{gradeLabels[item.grade]}</span>
                    )}
                  </div>
                  {item
                    ?<div style={{fontSize:"7px",color:"#a29bfe"}}>{item.effect}</div>
                    :<div style={{fontSize:"6px",color:"#2c2c54"}}>스테이지 {i+1} 클리어 시 획득</div>
                  }
                </div>
                {item&&(
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"2px"}}>
                    <div style={{width:"12px",height:"12px",borderRadius:"50%",background:gc,boxShadow:"0 0 8px "+gc}}/>
                    <div style={{fontSize:"5px",color:gc,whiteSpace:"nowrap"}}>{GN[item.grade]}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{fontSize:"7px",color:"#636e72",textAlign:"center",marginBottom:"10px"}}>6개 모두 모으면 🏰 스테이지 7 도전!</div>
        <button onClick={onClose} style={{background:"#6c5ce7",border:"3px solid #000",boxShadow:"3px 3px 0 #000",color:"#fff",fontFamily:PF,fontSize:"9px",padding:"9px 22px",cursor:"pointer",display:"block",margin:"0 auto",borderRadius:"3px"}}>닫기</button>
      </div>
    </div>
  );
}

function JobSelect({playerName,onSelect}){
  const[hover,setHover]=useState(null);
  return(
    <div style={{minHeight:"100vh",background:"#0a0a2e",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:PF,padding:"16px",boxSizing:"border-box"}}>
      <div style={{fontSize:"9px",color:"#ffd700",marginBottom:"10px"}}>⚔️ 직업을 선택하세요 ⚔️</div>
      <div style={{fontSize:"10px",color:"#fff",marginBottom:"6px"}}>{playerName}</div>
      <div style={{fontSize:"7px",color:"#a29bfe",marginBottom:"18px"}}>직업마다 얻는 장비가 달라요!</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",width:"100%",maxWidth:"360px"}}>
        {JOBS.map(job=>{const h=hover===job.id;return <button key={job.id} onMouseEnter={()=>setHover(job.id)} onMouseLeave={()=>setHover(null)} onClick={()=>onSelect(job)} style={{background:h?job.color+"33":"#16213e",border:"3px solid "+(h?job.color:"#2c2c54"),boxShadow:h?"0 0 16px "+job.color+"88, 4px 4px 0 #000":"4px 4px 0 #000",padding:"16px 10px",cursor:"pointer",transition:"all 0.15s",display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",borderRadius:"4px"}}><div style={{fontSize:"30px"}}>{job.icon}</div><div style={{fontSize:"10px",color:h?job.color:"#fff"}}>{job.name}</div><div style={{fontSize:"7px",color:"#a29bfe",whiteSpace:"pre-line",textAlign:"center",lineHeight:1.9}}>{job.desc}</div><div style={{display:"flex",gap:"3px",marginTop:"3px"}}>{job.di.map((ic,i)=><span key={i} style={{fontSize:"10px",opacity:0.75}}>{ic}</span>)}</div></button>;})}
      </div>
    </div>
  );
}

export default function App(){
  const cvs=useRef(null),frm=useRef(0),scr=useRef(0);
  const ani=useRef(null),hx=useRef(80),gst=useRef("walking");
  const fxR=useRef(null),tmr=useRef(null),shk=useRef(false),tFd=useRef(false);
  const mHPRef=useRef(1);

  const[screen,setScreen]=useState("title");
  const[nameInput,setNameInput]=useState("");
  const[job,setJob]=useState(null);
  const[si,setSi]=useState(0);
  const[mi,setMi]=useState(0);
  const[mHP,setMHP]=useState(1);
  const[mMax,setMMax]=useState(1);
  const[su,setSu]=useState(()=>mkUnits());
  const[player,setPlayer]=useState({name:"용사",hp:5,maxHp:5,exp:0,level:1,cleared:0,score:0,ct:0,wt:0});
  const[gold,setGold]=useState(0);
  const[equip,setEquip]=useState([null,null,null,null,null,null]);
  const[roul,setRoul]=useState(null);
  const[popup,setPopup]=useState(null);
  const[showShop,setShowShop]=useState(false);
  const[rankings,setRankings]=useState([]);
  const[rlLoaded,setRlLoaded]=useState(false);
  const[unlocked,setUnlocked]=useState(false);
  const[crazy,setCrazy]=useState(false);
  const[allInput,setAllInput]=useState(false);
  const[battle,setBattle]=useState(null);
  const[qi,setQi]=useState(0);
  const[ans,setAns]=useState([]);
  const[sel,setSel]=useState(null);
  const[showBat,setShowBat]=useState(false);
  const[showEq,setShowEq]=useState(false);
  const[resMsg,setResMsg]=useState("");
  const[showRes,setShowRes]=useState(false);
  const[combo,setCombo]=useState(0);
  const[comboMsg,setComboMsg]=useState("");
  const[timer,setTimer]=useState(20);
  const[baseTime,setBaseTime]=useState(20);
  const[frozen,setFrozen]=useState(false);
  const[inputVal,setInputVal]=useState("");
  const[pet,setPet]=useState(null);
  const[hintUsed,setHintUsed]=useState(false);
  const[answerTickets,setAnswerTickets]=useState(0);
  const[ansTicketUsed,setAnsTicketUsed]=useState(false);

  useEffect(()=>{(async()=>{try{const r=await window.storage.get("rankings",true);if(r)setRankings(JSON.parse(r.value));}catch(e){}try{const u=await window.storage.get("unlocked",true);if(u)setUnlocked(true);}catch(e){}setRlLoaded(true);})();},[]);
  useEffect(()=>{if(screen==="title"||screen==="ranking"||screen==="ending"||screen==="gameover"||screen==="jobselect")playBGM("title",140);},[screen]);
  useEffect(()=>{if(screen==="game")playBGM(STAGES[si].bk,155);},[si]);
  useEffect(()=>{if(showShop)playBGM("shop",140);},[showShop]);

  const saveScore=useCallback(async p=>{
    try{const r=await window.storage.get("rankings",true).catch(()=>null);let list=r?JSON.parse(r.value):[];list.push({name:p.name+(crazy?" 😈":"")+(allInput?" ✏️":""),score:p.score,level:p.level,cleared:p.cleared,correct:p.ct,wrong:p.wt,date:new Date().toLocaleDateString("ko-KR")});list.sort((a,b)=>b.score-a.score);list=list.slice(0,20);await window.storage.set("rankings",JSON.stringify(list),true);setRankings(list);}catch(e){}
  },[crazy,allInput]);

  const onRR=useCallback(grade=>{
    if(!job||roul==null)return;
    const slot=roul.slot;
    const efx=[["보스 배율 x1","보스 배율 x1.5","보스 배율 x2","보스 배율 x3","보스 배율 x5"],["방패 차단 1회","방패 차단 2회","방패 차단 3회","방패 차단 5회","방패 차단 무제한"],["부활 1회","부활 1회","부활 1회","부활 1회","부활 2회"],["콤보보너스 x1.5","콤보보너스 x2","콤보보너스 x2.5","콤보보너스 x3","콤보보너스 x5"],["시간+5초","시간+10초","시간+15초","시간+20초","시간+30초"],["점수+50","점수+100","점수+200","점수+500","점수+1000"]];
    const item={grade,name:job.dn[slot][grade],icon:job.di[slot],effect:efx[slot][grade],slot};
    setEquip(eq=>{const n=[...eq];n[slot]=item;return n;});
    setRoul(null);SFX.itemGet();setPopup({type:"item",item});
  },[job,roul]);

  const startGame=(name,j,cr,ai)=>{
    setJob(j);setCrazy(!!cr);setAllInput(!!ai);
    setPlayer({name,hp:5,maxHp:5,exp:0,level:1,cleared:0,score:0,ct:0,wt:0});
    setGold(0);setEquip([null,null,null,null,null,null]);setPet(null);setAnswerTickets(0);setAnsTicketUsed(false);
    const nu=mkUnits();setSu(nu);
    setSi(0);setMi(0);scr.current=0;hx.current=80;gst.current="walking";
    fxR.current=null;tFd.current=false;mHPRef.current=getMHP(0,0,!!cr);
    setCombo(0);setComboMsg("");setShowBat(false);setShowRes(false);setPopup(null);setRoul(null);setShowShop(false);
    const mhp=getMHP(0,0,!!cr);setMHP(mhp);setMMax(mhp);
    setRoul({slot:0,currentGrade:null});
    setScreen("game");
  };

  const MX=240,GMX=idx=>520+idx*MX;

  const triggerBattle=useCallback((midx,sidx)=>{
    const maxHP=getMHP(sidx,midx,crazy);
    const curHP=(midx===2&&mHPRef.current<maxHP&&mHPRef.current>0)?mHPRef.current:maxHP;
    setMHP(curHP);setMMax(maxHP);mHPRef.current=curHP;
    if(midx===2&&curHP===maxHP)SFX.boss();
    const uid=sidx===6?7:su[sidx].u;
    const qs=sidx===6?sh([...NP]).slice(0,curHP).map(p=>({q:p.q,a:p.a.toLowerCase().replace(/\s/g,""),type:"input",display:p.a})):Array.from({length:curHP},()=>genQ(uid,allInput));
    setBattle({monster:{name:MNAMES[sidx][midx],isBoss:midx===2},questions:qs,maxHP:curHP});
    setQi(0);setAns([]);setSel(null);setInputVal("");setHintUsed(false);setAnsTicketUsed(false);setEliminatedChoice(null);tFd.current=false;
    const bt=getBT(uid,crazy);setBaseTime(bt);setTimer(bt);setFrozen(false);setShowBat(true);
  },[su,crazy,allInput]);

  useEffect(()=>{
    if(!showBat||popup||roul||frozen||!crazy)return;
    clearInterval(tmr.current);
    tmr.current=setInterval(()=>{
      setTimer(t=>{
        if(t<=1){clearInterval(tmr.current);if(!tFd.current){tFd.current=true;SFX.timeout();setPlayer(p=>({...p,hp:Math.max(0,p.hp-1),score:Math.max(0,p.score-30)}));setComboMsg("⏱️ 시간초과! HP -1");setTimeout(()=>setComboMsg(""),1200);}setFrozen(true);return 0;}
        return t-1;
      });
    },1000);
    return()=>clearInterval(tmr.current);
  },[showBat,qi,frozen,popup,roul,crazy]);

  const atkSFX=useCallback(()=>{if(!job)return SFX.attack();if(job.id==="archer")SFX.bow();else if(job.id==="mage")SFX.staff();else if(job.id==="rogue")SFX.dagger();else SFX.attack();},[job]);

  useEffect(()=>{
    if(screen!=="game")return;
    const canvas=cvs.current;if(!canvas)return;
    const ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height;
    const loop=()=>{
      frm.current++;const f=frm.current,s=gst.current,cmx=GMX(mi);
      if(s==="walking"){hx.current+=1.6;if(hx.current>W*0.42){scr.current+=1.6;hx.current=W*0.42;}if(cmx-scr.current<W*0.58)gst.current="approaching";}
      if(s==="approaching"){if(cmx-scr.current>W*0.58)scr.current+=1.2;else{gst.current="battling";triggerBattle(mi,si);}}
      ctx.clearRect(0,0,W,H);
      if(crazy){const r=ctx.createLinearGradient(0,0,0,H*0.65);r.addColorStop(0,"#1a0000");r.addColorStop(1,"#b71c1c");ctx.fillStyle=r;ctx.fillRect(0,0,W,H*0.65);ctx.fillStyle="#e64a19";ctx.fillRect(0,H*0.65,W,H*0.35);ctx.fillStyle="#37474F";ctx.fillRect(0,H*0.72,W,H*0.28);}else{dBg(ctx,si,W,H,scr.current);}
      ctx.fillStyle=STAGES[si].accent+"99";ctx.fillRect(0,H*0.72-3,W,3);
      if(crazy){ctx.fillStyle="rgba(255,0,0,0.08)";ctx.fillRect(0,0,W,H);}
      for(let i=mi;i<3;i++){const mx=GMX(i)-scr.current;if(mx>-70&&mx<W+70){const iB=i===2;const hp=i===mi?mHP:getMHP(si,i,crazy);dMon(ctx,mx,H*0.72-(iB?34:18),i,MC[(si*3+i)%MC.length],f+i*22,shk.current&&i===mi,hp/getMHP(si,i,crazy));ctx.fillStyle=iB?"#FFD700":"#fff";ctx.font=(iB?"10px ":"9px ")+PF;ctx.textAlign="center";ctx.fillText(MNAMES[si][i]+(crazy?"😈":""),mx,H*0.72-(iB?72:52));if(iB){ctx.fillStyle="#FF4081";ctx.font="9px "+PF;ctx.fillText("👾BOSS",mx,H*0.72-86);}}}
      const look=HL[Math.min(player.cleared,HL.length-1)];
      if(pet){dPet(ctx,hx.current+22,H*0.72-14,pet.id,f);}
      dHero(ctx,hx.current,H*0.72-20,look,(s==="walking"||s==="approaching")?f:0,job?job.icon:null);
      if(fxR.current){const ef=fxR.current;ef.frame++;dFx(ctx,ef);if(ef.frame>=ef.maxFrame)fxR.current=null;}
      ctx.fillStyle=crazy?"rgba(80,0,0,0.8)":"rgba(0,0,0,0.6)";ctx.fillRect(0,0,W,44);
      ctx.fillStyle=job?job.color:"#FFD700";ctx.font="9px "+PF;ctx.textAlign="left";ctx.fillText((job?job.icon+" ":"")+player.name+(crazy?" 😈":""),8,17);
      ctx.fillStyle="#e74c3c";ctx.fillText("HP "+"♥".repeat(player.hp)+"♡".repeat(Math.max(0,player.maxHp-player.hp)),8,33);
      ctx.fillStyle="#a29bfe";ctx.textAlign="right";ctx.fillText(STAGES[si].label+" "+(mi+1)+"/3",W-8,17);
      ctx.fillStyle="#ffd700";ctx.fillText(player.score.toLocaleString()+"점 🪙"+gold,W-8,33);
      // 하단 장비 HUD는 React 레이어에서 처리 (EquipHUD 컴포넌트)
      ctx.fillStyle="rgba(255,255,255,0.18)";ctx.fillRect(W-48,H-26,42,22);ctx.fillStyle="#fff";ctx.font="8px "+PF;ctx.textAlign="center";ctx.fillText("장비",W-27,H-11);
      ani.current=requestAnimationFrame(loop);
    };
    ani.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(ani.current);
  },[screen,si,mi,mHP,player,equip,job,crazy,gold,triggerBattle]);

  const hCC=e=>{
    const canvas=cvs.current;if(!canvas)return;
    const rect=canvas.getBoundingClientRect();
    const cx=(e.clientX-rect.left)*(canvas.width/rect.width);
    const cy=(e.clientY-rect.top)*(canvas.height/rect.height);
    if(cx>canvas.width-48&&cy>canvas.height-26)setShowEq(true);
  };

  const[eliminatedChoice,setEliminatedChoice]=useState(null);

  const handleUseHint=()=>{
    if(!pet||pet.hintsLeft<=0||hintUsed)return;
    if(battle&&battle.questions[qi]&&battle.questions[qi].choices){
      const wrong=battle.questions[qi].choices.filter(c=>c!==battle.questions[qi].a);
      const pick=wrong[ri(0,wrong.length-1)];
      setEliminatedChoice(pick);
    }
    setPet(p=>({...p,hintsLeft:p.hintsLeft-1}));
    setHintUsed(true);
  };

  const afterAns=(correct,newAns,nc,newHP)=>{
    const canvas=cvs.current,H=canvas?canvas.height:310;
    const mx=GMX(mi)-scr.current,ey=H*0.72-(battle.monster.isBoss?34:18);
    const uid=si===6?7:su[si].u;
    if(correct){
      atkSFX();SFX.correct();
      const s0=equip[0],sdmg=s0?[0,0,1,2,3][s0.grade]:0;
      fxR.current={type:"hit",x:mx,y:ey,frame:0,maxFrame:25};
      shk.current=true;setTimeout(()=>{shk.current=false;},350);
      setTimeout(()=>{fxR.current={type:"dmg",x:mx,y:ey,frame:0,maxFrame:32,label:sdmg>0?"-"+(1+sdmg):"−1"};},200);
      if(nc>=2)setTimeout(()=>{fxR.current={type:"combo",x:mx,y:ey-20,frame:0,maxFrame:36,count:nc};},350);
      const fHP=Math.max(0,newHP-sdmg);if(sdmg>0){setMHP(fHP);mHPRef.current=fHP;}
      setTimeout(()=>{
        if(fHP<=0){fxR.current={type:"kill",x:mx,y:ey,frame:0,maxFrame:58};setTimeout(()=>finishMon(newAns,nc),700);}
        else if(qi+1<battle.questions.length){setQi(qi+1);setSel(null);setInputVal("");setHintUsed(false);setAnsTicketUsed(false);setEliminatedChoice(null);tFd.current=false;const bt=getBT(uid,crazy);setBaseTime(bt);setTimer(bt);setFrozen(false);}
        else battleFail(newAns);
      },sdmg>0?1400:700);
    }else{
      SFX.miss();SFX.wrong();
      fxR.current={type:"miss",x:mx,y:ey,frame:0,maxFrame:28};
      setTimeout(()=>{
        if(qi+1<battle.questions.length){setQi(qi+1);setSel(null);setInputVal("");setHintUsed(false);setAnsTicketUsed(false);setEliminatedChoice(null);tFd.current=false;const bt=getBT(uid,crazy);setBaseTime(bt);setTimer(bt);setFrozen(false);}
        else battleFail(newAns);
      },700);
    }
  };

  const handleAnswer=choice=>{
    clearInterval(tmr.current);
    const correct=choice===battle.questions[qi].a;
    const newAns=[...ans,{correct}];setAns(newAns);setSel(choice);
    const nc=correct?combo+1:0;setCombo(nc);
    if(correct){const msg=nc>=5?"🔥"+nc+"연속!! 대박!":nc>=3?"⚡"+nc+"콤보!":nc>=2?"✨"+nc+"콤보!":"";if(msg){setComboMsg(msg);setTimeout(()=>setComboMsg(""),1000);}}
    else{setCombo(0);setComboMsg("💨 오답!");setTimeout(()=>setComboMsg(""),800);}
    const nHP=correct?mHP-1:mHP;if(correct){setMHP(nHP);mHPRef.current=nHP;}
    afterAns(correct,newAns,nc,nHP);
  };

  const handleSubmit=()=>{
    clearInterval(tmr.current);
    const ua=inputVal.toLowerCase().replace(/\s/g,"");
    const correct=ua===battle.questions[qi].a;
    const newAns=[...ans,{correct}];setAns(newAns);setInputVal("");
    const nc=correct?combo+1:0;setCombo(nc);
    if(correct){const msg=nc>=5?"🔥"+nc+"연속!!":nc>=3?"⚡"+nc+"콤보!":nc>=2?"✨"+nc+"콤보!":"";if(msg){setComboMsg(msg);setTimeout(()=>setComboMsg(""),1000);}}
    else{setCombo(0);setComboMsg("💨 오답! 정답: "+battle.questions[qi].display);setTimeout(()=>setComboMsg(""),1400);}
    const nHP=correct?mHP-1:mHP;if(correct){setMHP(nHP);mHPRef.current=nHP;}
    afterAns(correct,newAns,nc,nHP);
  };

  const finishMon=(al,fc)=>{
    clearInterval(tmr.current);setShowBat(false);
    const correct=al.filter(a=>a.correct).length,wrong=al.length-correct;
    const iB=battle.monster.isBoss;
    if(iB)SFX.clear();else SFX.correct();
    const s3=equip[3],fm=s3?[1.5,2,2.5,3,5][s3.grade]:1;
    const s5=equip[5],cb2=s5?[50,100,200,500,1000][s5.grade]:0;
    const cbn=Math.floor((fc||0)*20*fm);
    const score=iB?500+correct*50:100+correct*30+cbn+cb2;
    const baseGold=iB?50:15;
    const comboGoldBonus=fc>=3?Math.floor(baseGold*0.5):0;
    const earnedGold=Math.floor((baseGold+comboGoldBonus)*(crazy?2:1));
    setGold(g=>g+earnedGold);SFX.coin();
    const canvas=cvs.current,H=canvas?canvas.height:310;
    const mx=GMX(mi)-scr.current,ey=H*0.72-(iB?34:18);
    setTimeout(()=>{fxR.current={type:"coin",x:mx,y:ey-30,frame:0,maxFrame:40,label:"+"+earnedGold+"G"+(fc>=3?" 콤보보너스!":"")};},300);
    const newExp=player.exp+(iB?100:20+si*5),nLv=Math.floor(newExp/100)+1;
    const nextMi=mi+1;
    if(nextMi>=3){
      gst.current="stageclear";
      setRoul({slot:si<6?si:null,currentGrade:equip[si]?equip[si].grade:null});
      setPlayer(p=>{const np={...p,exp:newExp,level:nLv,score:p.score+score,cleared:p.cleared+1,ct:p.ct+correct,wt:p.wt+wrong};return np;});
      setResMsg("🎉 클리어! +"+score+"점 🪙+"+earnedGold+"G");
      setShowRes(true);
    }else{
      setMi(nextMi);gst.current="walking";
      const nhp=getMHP(si,nextMi,crazy);setMHP(nhp);setMMax(nhp);mHPRef.current=nhp;
      setPlayer(p=>({...p,exp:newExp,level:nLv,score:p.score+score,ct:p.ct+correct,wt:p.wt+wrong}));
      setResMsg("✅ 처치! +"+score+"점 🪙+"+earnedGold+"G");
      setShowRes(true);setTimeout(()=>setShowRes(false),1800);
    }
  };

  const battleFail=al=>{
    clearInterval(tmr.current);setShowBat(false);setCombo(0);
    const correct=al.filter(a=>a.correct).length,wrong=al.length-correct;
    const s2=equip[2];
    if(player.hp<=1&&s2){
      SFX.revive();setEquip(eq=>{const n=[...eq];n[2]=null;return n;});
      setPlayer(p=>({...p,hp:2,ct:p.ct+correct,wt:p.wt+wrong}));
      setPopup({type:"revive",item:s2});
      setTimeout(()=>{setPopup(null);gst.current="walking";hx.current=Math.max(50,hx.current-80);setResMsg("👼 부활! HP 2 회복");setShowRes(true);setTimeout(()=>setShowRes(false),2000);},2200);
    }else{
      setPlayer(p=>{const np={...p,hp:Math.max(0,p.hp-1),score:Math.max(0,p.score-50),wt:p.wt+wrong,ct:p.ct+correct};if(np.hp<=0){saveScore(np);gst.current="gameover";setScreen("gameover");}else{gst.current="walking";hx.current=Math.max(50,hx.current-80);setResMsg("💔 패배... -50점");setShowRes(true);setTimeout(()=>setShowRes(false),1800);}return np;});
    }
  };

  const openShop=()=>{setShowRes(false);setShowShop(true);};
  const nextStage=()=>{
    const next=si+1;
    if(next>=STAGES.length){
      const finalP={...player,score:player.score,cleared:player.cleared};
      goEnding(finalP);return;
    }
    if(next===6){const ok=equip.every(e=>e!=null);if(!ok){setResMsg("⚠️ 장비 6개를 모두 모아야 스테이지 7에 도전!");setShowRes(true);setTimeout(()=>setShowRes(false),2500);return;}}
    setSi(next);setMi(0);scr.current=0;hx.current=80;gst.current="walking";fxR.current=null;
    const nhp=getMHP(next,0,crazy);setMHP(nhp);setMMax(nhp);mHPRef.current=nhp;
    setShowShop(false);
  };

  const goEnding=useCallback(async(p)=>{await saveScore(p);setScreen("ending");},[saveScore]);

  const uname=si===6?"넌센스":(su[si]?su[si].n:"");

  if(screen==="title") return(
    <div style={{minHeight:"100vh",background:"#0a0a2e",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:PF,padding:"12px",boxSizing:"border-box"}}>
      <div style={{textAlign:"center",width:"100%",maxWidth:"360px"}}>
        <div style={{fontSize:"9px",color:"#ffd700",marginBottom:"5px"}}>⚔️ 초등 3-1 수학 RPG ⚔️</div>
        <div style={{fontSize:"clamp(13px,4vw,19px)",color:"#fff",textShadow:"3px 3px 0 #6c5ce7",marginBottom:"3px"}}>솩 마법의 탑</div>
        <div style={{fontSize:"9px",color:"#a29bfe",marginBottom:"12px"}}>3-1</div>
        <div style={{fontSize:"7px",color:"#a29bfe",marginBottom:"14px",lineHeight:2}}>장비 6개를 모아 스테이지 7 도전!<br/>스테이지 클리어마다 🏪 상점 오픈!</div>
        <div style={{background:"#16213e",border:"3px solid #a29bfe",padding:"14px",marginBottom:"12px",boxShadow:"4px 4px 0 #000",borderRadius:"4px"}}>
          <div style={{fontSize:"8px",color:"#a29bfe",marginBottom:"10px"}}>용사의 이름을 입력하세요</div>
          <input value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&nameInput.trim())setScreen("jobselect");}} placeholder="이름 입력" style={{background:"#0a0a2e",border:"2px solid #6c5ce7",color:"#fff",fontFamily:PF,fontSize:"11px",padding:"8px 12px",width:"160px",textAlign:"center",borderRadius:"3px"}}/>
        </div>
        <button onClick={()=>nameInput.trim()&&setScreen("jobselect")} style={{background:"#6c5ce7",border:"3px solid #000",boxShadow:"4px 4px 0 #000",color:"#fff",fontFamily:PF,fontSize:"10px",padding:"12px 20px",cursor:"pointer",marginBottom:"8px",display:"block",width:"100%",borderRadius:"3px"}}>🗡️ 탑 오르기</button>
        {unlocked&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"8px"}}>
            <button onClick={()=>{if(nameInput.trim())setScreen("jobselect_crazy");}} style={{background:"#b71c1c",border:"3px solid #000",boxShadow:"4px 4px 0 #000",color:"#fff",fontFamily:PF,fontSize:"8px",padding:"10px 8px",cursor:"pointer",borderRadius:"3px"}}>😈 크레이지</button>
            <button onClick={()=>{if(nameInput.trim())setScreen("jobselect_input");}} style={{background:"#FF8C00",border:"3px solid #000",boxShadow:"4px 4px 0 #000",color:"#fff",fontFamily:PF,fontSize:"8px",padding:"10px 8px",cursor:"pointer",borderRadius:"3px"}}>✏️ 올주관식</button>
          </div>
        )}
        <button onClick={()=>setScreen("ranking")} style={{background:"#e17055",border:"3px solid #000",boxShadow:"4px 4px 0 #000",color:"#fff",fontFamily:PF,fontSize:"9px",padding:"10px 20px",cursor:"pointer",display:"block",width:"100%",borderRadius:"3px"}}>🏆 명예의 전당</button>
      </div>
    </div>
  );

  if(screen==="jobselect") return <JobSelect playerName={nameInput} onSelect={j=>startGame(nameInput,j,false,false)}/>;
  if(screen==="jobselect_crazy") return <JobSelect playerName={nameInput} onSelect={j=>startGame(nameInput,j,true,false)}/>;
  if(screen==="jobselect_input") return <JobSelect playerName={nameInput} onSelect={j=>startGame(nameInput,j,false,true)}/>;

  if(screen==="ranking") return(
    <div style={{minHeight:"100vh",background:"#0a0a2e",fontFamily:PF,padding:"16px",boxSizing:"border-box"}}>
      <div style={{textAlign:"center",marginBottom:"16px"}}><div style={{fontSize:"13px",color:"#FFD700",marginBottom:"5px"}}>🏆 명예의 전당</div><div style={{fontSize:"8px",color:"#a29bfe"}}>솩 마법의 탑 3-1</div></div>
      {!rlLoaded?<div style={{textAlign:"center",fontSize:"9px",color:"#636e72",marginTop:"40px"}}>불러오는 중...</div>
      :rankings.length===0?<div style={{textAlign:"center",fontSize:"9px",color:"#636e72",marginTop:"40px",lineHeight:2.5}}><div>아직 기록이 없어요!</div><div>첫 번째 영웅이 되세요!</div></div>
      :<div style={{display:"flex",flexDirection:"column",gap:"7px",marginBottom:"16px"}}>{rankings.map((r,i)=>{const bc=i===0?"#FFD700":i===1?"#B0BEC5":i===2?"#CD7F32":"#2c2c54";const bg=i===0?"#2d2000":i===1?"#1a1a2e":i===2?"#1a1200":"#16213e";const nc=i===0?"#FFD700":i===1?"#B0BEC5":i===2?"#CD7F32":"#fff";return<div key={i} style={{background:bg,border:"2px solid "+bc,padding:"11px 13px",display:"flex",alignItems:"center",gap:"10px",boxShadow:i<3?"3px 3px 0 #000":"none",borderRadius:"3px"}}><div style={{fontSize:i<3?"15px":"10px",minWidth:"26px",textAlign:"center"}}>{i<3?medals[i]:""+(i+1)}</div><div style={{flex:1}}><div style={{fontSize:"10px",color:nc,marginBottom:"3px"}}>{r.name}</div><div style={{fontSize:"7px",color:"#a29bfe"}}>{"Lv."+r.level+" | "+r.cleared+"스테이지 | "+r.date}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:"11px",color:"#ffd700"}}>{r.score.toLocaleString()+"점"}</div><div style={{fontSize:"7px",color:"#2ecc71"}}>{"⭕"+r.correct+" ❌"+r.wrong}</div></div></div>;})}
      </div>}
      <button onClick={()=>setScreen("title")} style={{background:"#6c5ce7",border:"3px solid #000",boxShadow:"3px 3px 0 #000",color:"#fff",fontFamily:PF,fontSize:"9px",padding:"10px 22px",cursor:"pointer",display:"block",margin:"0 auto",borderRadius:"3px"}}>← 돌아가기</button>
    </div>
  );

  if(screen==="ending") return(
    <div style={{minHeight:"100vh",background:"#0a0a2e",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:PF,textAlign:"center",padding:"20px",boxSizing:"border-box"}}>
      <div style={{fontSize:"44px",marginBottom:"14px"}}>🏆</div>
      <div style={{fontSize:"13px",color:"#FFD700",marginBottom:"10px"}}>GAME CLEAR!</div>
      <div style={{fontSize:"9px",color:job?job.color:"#fff",marginBottom:"14px"}}>{job?job.icon+" ":""}{player.name} {job?job.name:""}</div>
      <div style={{background:"#16213e",border:"3px solid #FFD700",padding:"18px",marginBottom:"18px",boxShadow:"4px 4px 0 #000",borderRadius:"4px"}}>
        <div style={{fontSize:"16px",color:"#FFD700",marginBottom:"6px"}}>{player.score.toLocaleString()}점</div>
        <div style={{fontSize:"9px",color:"#ffd700",marginBottom:"10px"}}>🪙 최종 골드: {gold}G</div>
        <div style={{fontSize:"8px",color:"#a29bfe",lineHeight:2.2}}><div>Lv.{player.level} | 정답 {player.ct}개</div><div>정답률 {player.ct+player.wt>0?Math.round(player.ct/(player.ct+player.wt)*100):0}%</div></div>
        {!unlocked&&<div style={{marginTop:"12px",padding:"8px",background:"rgba(255,215,0,0.1)",border:"1px solid #FFD700",borderRadius:"4px"}}>
          <div style={{fontSize:"8px",color:"#FFD700"}}>🔓 특수 모드 해금!</div>
          <div style={{fontSize:"7px",color:"#a29bfe",marginTop:"4px"}}>😈 크레이지 / ✏️ 올주관식</div>
        </div>}
        <div style={{marginTop:"16px",borderTop:"2px solid #333",paddingTop:"12px"}}>
          <div style={{fontSize:"7px",color:"#636e72",marginBottom:"5px"}}>만든 사람</div>
          <div style={{fontSize:"9px",color:"#E040FB",textShadow:"0 0 10px #E040FB"}}>🪱 우주최강 멋진 지렁이 🪱</div>
        </div>
      </div>
      <div style={{display:"flex",gap:"10px"}}>
        <button onClick={()=>setScreen("ranking")} style={{background:"#e17055",border:"3px solid #000",boxShadow:"3px 3px 0 #000",color:"#fff",fontFamily:PF,fontSize:"9px",padding:"11px 16px",cursor:"pointer",borderRadius:"3px"}}>🏆 랭킹</button>
        <button onClick={async()=>{if(!unlocked){setUnlocked(true);try{await window.storage.set("unlocked","1",true);}catch(e){}}setScreen("title");}} style={{background:"#6c5ce7",border:"3px solid #000",boxShadow:"3px 3px 0 #000",color:"#fff",fontFamily:PF,fontSize:"9px",padding:"11px 16px",cursor:"pointer",borderRadius:"3px"}}>🔄 다시 하기</button>
      </div>
    </div>
  );

  if(screen==="gameover") return(
    <div style={{minHeight:"100vh",background:"#0a0a2e",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:PF,textAlign:"center",padding:"20px",boxSizing:"border-box"}}>
      <div style={{fontSize:"44px",marginBottom:"14px"}}>💀</div>
      <div style={{fontSize:"15px",color:"#e74c3c",marginBottom:"14px"}}>GAME OVER</div>
      <div style={{background:"#16213e",border:"3px solid #e74c3c",padding:"16px",marginBottom:"22px",boxShadow:"3px 3px 0 #000",borderRadius:"4px"}}>
        <div style={{fontSize:"10px",color:job?job.color:"#fff",marginBottom:"8px"}}>{job?job.icon+" ":""}{player.name}</div>
        <div style={{fontSize:"16px",color:"#ffd700",marginBottom:"4px"}}>{player.score.toLocaleString()}점</div>
        <div style={{fontSize:"9px",color:"#ffd700",marginBottom:"8px"}}>🪙 {gold}G 획득</div>
        <div style={{fontSize:"8px",color:"#a29bfe",lineHeight:2.2}}><div>Lv.{player.level} | {player.cleared}스테이지</div><div>정답 {player.ct}개 | 오답 {player.wt}개</div></div>
      </div>
      <div style={{display:"flex",gap:"10px"}}>
        <button onClick={()=>setScreen("ranking")} style={{background:"#e17055",border:"3px solid #000",boxShadow:"3px 3px 0 #000",color:"#fff",fontFamily:PF,fontSize:"9px",padding:"11px 16px",cursor:"pointer",borderRadius:"3px"}}>🏆 랭킹</button>
        <button onClick={()=>setScreen("title")} style={{background:"#e74c3c",border:"3px solid #000",boxShadow:"3px 3px 0 #000",color:"#fff",fontFamily:PF,fontSize:"9px",padding:"11px 16px",cursor:"pointer",borderRadius:"3px"}}>🔄 다시 시작</button>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"#0a0a2e",display:"flex",alignItems:"center",justifyContent:"center",padding:"8px",boxSizing:"border-box"}}>
      <div style={{position:"relative",width:"100%",maxWidth:"480px"}}>
        <canvas ref={cvs} width={480} height={310} onClick={hCC} style={{display:"block",imageRendering:"pixelated",border:"4px solid "+(crazy?"#FF4081":"#6c5ce7"),boxShadow:"0 0 22px "+(crazy?"#FF4081":"#6c5ce7"),width:"100%",height:"auto",cursor:"pointer"}}/>

        {/* ★ 장비 HUD: 등급 색상 테두리 + 호버 툴팁 */}
        {!showBat&&!roul&&!popup&&!showShop&&job&&(
          <EquipHUD equip={equip} job={job} onOpenEquip={()=>setShowEq(true)}/>
        )}

        {roul&&roul.slot!=null&&!popup&&<RouletteScreen slot={roul.slot} job={job} currentGrade={roul.currentGrade} onResult={onRR}/>}
        {popup&&<DramaticPopup type={popup.type} item={popup.item} onClose={()=>{if(popup.type!=="revive")setPopup(null);}}/>}
        {showShop&&<ShopScreen gold={gold} setGold={setGold} player={player} setPlayer={setPlayer} equip={equip} setEquip={setEquip} job={job} pet={pet} setPet={setPet} answerTickets={answerTickets} setAnswerTickets={setAnswerTickets} onClose={nextStage}/>}
        {showBat&&battle&&!roul&&!popup&&!showShop&&(
          <BattleModal q={battle.questions[qi]} onAnswer={handleAnswer} si={si} monName={battle.monster.name} isBoss={battle.monster.isBoss} combo={combo} comboMsg={comboMsg} timer={timer} baseTime={baseTime} frozen={frozen} inputVal={inputVal} setInputVal={setInputVal} onSubmit={handleSubmit} mHP={mHP} mMaxHP={mMax} answers={ans} selected={sel} unitName={uname} gold={gold} crazy={crazy} allInput={allInput} pet={pet} onUseHint={handleUseHint} hintUsed={hintUsed} answerTickets={answerTickets} ansTicketUsed={ansTicketUsed} onUseAnsTicket={()=>{if(answerTickets>0&&!ansTicketUsed){setAnswerTickets(t=>t-1);setAnsTicketUsed(true);}}} eliminatedChoice={eliminatedChoice}/>        )}
        {showEq&&job&&<EquipModal equipment={equip} job={job} onClose={()=>setShowEq(false)}/>}
        {showRes&&!showBat&&!roul&&!popup&&!showShop&&(
          <div style={{position:"absolute",bottom:"10px",left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.9)",border:"2px solid #ffd700",padding:"12px 18px",fontFamily:PF,fontSize:"8px",color:"#ffd700",boxShadow:"3px 3px 0 #000",zIndex:5,textAlign:"center",maxWidth:"92%",boxSizing:"border-box",whiteSpace:"nowrap",borderRadius:"4px"}}>
            {resMsg}
            {gst.current==="stageclear"&&!roul&&!popup&&(
              <div style={{marginTop:"10px"}}>
                <button onClick={openShop} style={{background:"#e17055",border:"2px solid #000",color:"#fff",fontFamily:PF,fontSize:"8px",padding:"8px 16px",cursor:"pointer",boxShadow:"2px 2px 0 #000",borderRadius:"3px"}}>🏪 상점 열기</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}