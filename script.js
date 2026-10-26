/* Personal settings: edit these before sharing. */
const SETTINGS = {
  relationshipStartDate: "2026-09-12", // Дата начала отношений (YYYY-MM-DD).
  initialLetter: "Может, получилось не идеально, но я правда вложил в это душу. Я не всегда умею сказать, как сильно тебя люблю, поэтому захотел показать это по-своему. Что бы ни случилось, мне хочется быть рядом с тобой. Время вместе — самое счастливое для меня. Ты прекрасна именно такая, какая есть. С нашей первой встречи я понял, что ты стала для меня самым дорогим человеком. Я очень тебя люблю!",
  galaxyWordCount: 1800,
};
const scenes = ["scene-envelope", "scene-letter", "scene-galaxy", "scene-portrait"].map((id) => document.getElementById(id));
const letterField = document.getElementById("love-letter");
const letterCount = document.getElementById("letter-count");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let currentScene = 0, galaxy = null;
letterField.value = SETTINGS.initialLetter;
updateWordCount();
function updateWordCount() {
  const count = letterField.value.trim().split(/\s+/u).filter(Boolean).length;
  letterCount.textContent = `${count} ${count === 1 ? "слово" : count > 1 && count < 5 ? "слова" : "слов"}`;
}
function showScene(index) {
  if (index < 0 || index >= scenes.length || index === currentScene) return;
  scenes[currentScene].classList.remove("is-active");
  scenes[currentScene].setAttribute("aria-hidden", "true");
  scenes[index].classList.add("is-active");
  scenes[index].setAttribute("aria-hidden", "false");
  currentScene = index;
  if (index === 2) startGalaxy(); else stopGalaxy();
  if (index === 3) renderFinalLetter();
}
function openEnvelope() {
  const button = document.getElementById("open-envelope");
  if (button.classList.contains("is-opening")) return;
  button.classList.add("is-opening");
  window.setTimeout(() => showScene(1), reducedMotion.matches ? 50 : 1050);
}
document.getElementById("open-envelope").addEventListener("click", openEnvelope);
document.getElementById("back-envelope").addEventListener("click", () => showScene(0));
document.getElementById("show-galaxy").addEventListener("click", () => showScene(2));
document.getElementById("back-letter").addEventListener("click", () => showScene(1));
document.getElementById("show-portrait").addEventListener("click", (event) => {
  if (!galaxy || !galaxy.portraitStarted) {
    if (!galaxy) startGalaxy();
    galaxy.formPortrait();
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = "Слова собираются…";
    window.setTimeout(() => { button.disabled = false; button.innerHTML = "Посмотреть на нас ближе <span>→</span>"; }, reducedMotion.matches ? 50 : 4300);
    return;
  }
  const canvas = document.getElementById("universe");
  canvas.style.transition = "opacity .9s, transform .9s";
  canvas.style.opacity = "0"; canvas.style.transform = "scale(.08)";
  window.setTimeout(() => { canvas.style.cssText = ""; showScene(3); }, reducedMotion.matches ? 30 : 880);
});
letterField.addEventListener("input", updateWordCount);
function renderFinalLetter() {
  const text = letterField.value.trim();
  document.getElementById("letter-excerpt").textContent = text ? `«${text}»` : "Пусть даже сегодня слова промолчат — моё сердце всё равно выбрало тебя.";
  const duration = document.getElementById("love-duration");
  const date = new Date(`${SETTINGS.relationshipStartDate}T00:00:00`);
  if (!SETTINGS.relationshipStartDate || Number.isNaN(date.getTime()) || date > new Date()) { duration.hidden = true; return; }
  duration.hidden = false;
  const today = new Date();
  let years = today.getFullYear() - date.getFullYear();
  let months = today.getMonth() - date.getMonth();
  let remainder = today.getDate() - date.getDate();
  if (remainder < 0) {
    remainder += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    months -= 1;
  }
  if (months < 0) { months += 12; years -= 1; }
  const parts = [];  if (years) parts.push(`${years} ${plural(years, "год", "года", "лет")}`);
  if (months) parts.push(`${months} ${plural(months, "месяц", "месяца", "месяцев")}`);
  parts.push(`${remainder} ${plural(remainder, "день", "дня", "дней")}`);
  document.getElementById("duration-value").textContent = parts.join(" · ");
}
function plural(n, one, few, many) { const t=n%10,h=n%100; return t===1&&h!==11?one:t>=2&&t<=4&&(h<12||h>14)?few:many; }
document.getElementById("restart").addEventListener("click", () => { document.getElementById("open-envelope").classList.remove("is-opening"); showScene(0); });
const loveWords = ["Люблю","Я тебя люблю","I love you","Je t’aime","Te amo","Ti amo","Ich liebe dich","Я тебя кохаю","Seni seviyorum","愛してる","사랑해","我爱你","أحبك","Σ’ αγαπώ","Kocham cię","Ik hou van jou","Eu te amo","Mahal kita","Я люблю тебя","Te quiero","Я кахаю цябе","אני אוהב אותך","मैं तुमसे प्यार करता हूँ","รักคุณ","Jag älskar dig","Jeg elsker deg","Jeg elsker dig","Rakastan sinua","Ma armastan sind","Es tevi mīlu","Aš tave myliu","Miluji tě","Ľúbim ťa","Szeretlek","S’agapó","Volim te","Ljubim te","T’estimo","Quérote","Amo-te","Nakupenda","Ndagukunda","Mi amas vin","Vôi yêu bạn","Anh yêu em","사랑합니다","รักคุณ","Mahal na mahal kita","Kuv hlub koj","愛してるよ","Te iubesc","Ik hou van jou","أنا أحبك","Te amo mucho","Mwen renmen ou","Aloha wau iā ʻoe","Main tumse pyar karta hoon"];
function startGalaxy() { const canvas=document.getElementById("universe"); if(!galaxy) galaxy=new WordGalaxy(canvas); galaxy.start(); }
function stopGalaxy() { if(galaxy) galaxy.stop(); }
class WordGalaxy {
  constructor(canvas) {
    this.canvas=canvas; this.context=canvas.getContext("2d",{alpha:true}); this.frame=0; this.active=false; this.words=[]; this.stars=[]; this.portraitStarted=false; this.portraitStartTime=0; this.userRotation=0; this.dragPointer=null; this.lastPointerX=0;
    canvas.setAttribute("tabindex","0");
    canvas.addEventListener("pointerdown", event => this.beginRotate(event));
    canvas.addEventListener("pointermove", event => this.rotateWithPointer(event));
    canvas.addEventListener("pointerup", event => this.endRotate(event));
    canvas.addEventListener("pointercancel", event => this.endRotate(event));
    canvas.addEventListener("keydown", event => this.rotateWithKeyboard(event));
    this.resizeHandler = () => this.resize();
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.resizeHandler);
      this.resizeObserver.observe(canvas);
    } else {
      window.addEventListener("resize", this.resizeHandler, { passive: true });
    }
    this.resize();
  }
  beginRotate(event) {
    if (this.portraitStarted || (event.button !== 0 && event.pointerType === "mouse")) return;
    this.dragPointer = event.pointerId; this.lastPointerX = event.clientX;
    this.canvas.classList.add("is-dragging");
    if (typeof this.canvas.setPointerCapture === "function") this.canvas.setPointerCapture(event.pointerId);
  }
  rotateWithPointer(event) {
    if (this.portraitStarted || event.pointerId !== this.dragPointer) return;
    this.userRotation += (event.clientX - this.lastPointerX) * .009;
    this.lastPointerX = event.clientX;
  }
  endRotate(event) {
    if (event.pointerId !== this.dragPointer) return;
    this.dragPointer = null; this.canvas.classList.remove("is-dragging");
    if (typeof this.canvas.hasPointerCapture === "function" && this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
  }
  rotateWithKeyboard(event) {
    if (!this.portraitStarted && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault(); this.userRotation += event.key === "ArrowLeft" ? -.16 : .16;
    }
  }
  resize() {
    const b=this.canvas.getBoundingClientRect(); if(!b.width||!b.height)return;
    this.width=b.width;this.height=b.height;this.dpr=Math.min(window.devicePixelRatio||1,1.5);
    this.canvas.width=Math.round(this.width*this.dpr);this.canvas.height=Math.round(this.height*this.dpr);if(this.context)this.context.setTransform(this.dpr,0,0,this.dpr,0,0);
    const mobile=this.width<650, target=Math.min(SETTINGS.galaxyWordCount,mobile?520:900);
    this.words=Array.from({length:target},(_,i)=>{
      const depth=Math.random(), angle=Math.random()*Math.PI*2;
      return {angle,radius:Math.sqrt(Math.random()),depth,phase:Math.random()*8,text:loveWords[i%loveWords.length],size:mobile?8+Math.random()*3:9+Math.random()*5,hue:Math.random()<.72?335+Math.random()*35:36+Math.random()*22};
    });
    this.stars=Array.from({length:Math.min(280,Math.round(this.width*this.height/4300))},()=>({x:Math.random()*this.width,y:Math.random()*this.height,size:Math.random()*1.3+.25,phase:Math.random()*7,speed:Math.random()*.025+.004}));
    this.preparePortrait();
  }
  preparePortrait() {
    const source = document.getElementById("word-portrait-source");
    if (!source || !source.complete || !source.naturalWidth) { this.portraitPoints = []; return; }
    const height = Math.min(this.height * .66, this.width * .8, 560);
    const width = Math.min(height * .55, this.width * .45);
    const left = (this.width - width) / 2, top = this.height * .53 - height / 2;
    const sample = document.createElement("canvas");
    sample.width = Math.round(width); sample.height = Math.round(height);
    const sampleContext = sample.getContext("2d", { willReadFrequently: true });
    sampleContext.drawImage(source, 0, 0, sample.width, sample.height);

    const pixels = sampleContext.getImageData(0, 0, sample.width, sample.height).data;
    const words = ["Люблю", "Я тебя люблю", "Love", "I love you", "Amor", "Amo", "Te amo", "Ti amo", "Je t’aime", "Je t’adore", "Ich liebe dich", "Ich hab dich lieb", "愛してる", "愛しています", "사랑해", "사랑해요", "我爱你", "我愛你", "أحبك", "أنا أحبك", "Σ’ αγαπώ", "Kocham cię", "Kocham", "Ik hou van jou", "Eu te amo", "Mahal kita", "Mahal na mahal kita", "Seni seviyorum", "Te quiero", "Te amo mucho", "Я тебе кохаю", "Я тебя кохаю", "Я кахаю цябе", "Jag älskar dig", "Jeg elsker deg", "Jeg elsker dig", "Rakastan sinua", "Ma armastan sind", "Es tevi mīlu", "Aš tave myliu", "Miluji tě", "Ľúbim ťa", "Szeretlek", "Volim te", "Ljubim te", "T’estimo", "Quérote", "Amo-te", "Ti voglio bene", "Te iubesc", "Обичам те", "Волим те", "Te dua", "Nakupenda", "Mo nífẹ̀ẹ́ rẹ", "Ngiyakuthanda", "Ndiyakuthanda", "Ek is lief vir jou", "Aku cinta kamu", "Anh yêu em", "รักคุณ", "ฉันรักคุณ", "আমি তোমাকে ভালোবাসি", "मैं तुमसे प्यार करता हूँ", "אני אוהב אותך", "אני אוהבת אותך", "მიყვარხარ", "Ես քեզ սիրում եմ", "Мен сені жақсы көремін", "Men seni sevaman", "Би чамд хайртай", "Aloha wau iā ʻoe", "Kuv hlub koj", "รักเธอ", "愛", "Люблю тебя"];
    const stepX = Math.max(8, Math.min(13, width / 18));
    const stepY = stepX * .68;
    this.portraitPoints = [];
    let index = 0;
    for (let y = stepY / 2; y < height; y += stepY) {
      for (let x = stepX / 2; x < width; x += stepX) {
        const offset = (Math.min(sample.height - 1, Math.round(y)) * sample.width + Math.min(sample.width - 1, Math.round(x))) * 4;
        const r = pixels[offset], g = pixels[offset + 1], b = pixels[offset + 2];
        const alpha = pixels[offset + 3] / 255;
        if (alpha < .36) continue;
        const light = (r * .2126 + g * .7152 + b * .0722) / 255;
        this.portraitPoints.push({ x: left + x, y: top + y, alpha, color: `rgb(${Math.min(255, r + 72)},${Math.min(255, g + 56)},${Math.min(255, b + 62)})`, light, word: words[index++ % words.length] });
      }
    }
  }
  formPortrait() {
    if (!this.portraitPoints.length || this.portraitStarted) return;
    this.portraitStarted = true;
    this.lockedRotation = this.userRotation + (reducedMotion.matches ? 0 : (performance.now() - this.startedAt) * .000025);
    document.getElementById("scene-galaxy").classList.add("is-forming");
    this.portraitStartTime = performance.now();
  }
  start(){if(this.active)return;this.active=true;this.startedAt=performance.now();requestAnimationFrame(()=>{this.resize();if(this.context)this.draw(performance.now());});}
  stop(){this.active=false;cancelAnimationFrame(this.frame);}
  draw(time){
    if(!this.active||!this.context||!this.width||!this.height)return;
    const ctx=this.context,w=this.width,h=this.height;ctx.clearRect(0,0,w,h);
    const glow=ctx.createRadialGradient(w*.5,h*.51,0,w*.5,h*.51,Math.min(w,h)*.53);glow.addColorStop(0,"rgba(104,38,91,.22)");glow.addColorStop(.42,"rgba(66,26,75,.12)");glow.addColorStop(1,"rgba(9,8,17,0)");ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    const cx=w*.5,cy=h*.53;
    for(const star of this.stars){ctx.globalAlpha=reducedMotion.matches ? .5 : .35 + (Math.sin(time*star.speed+star.phase)+1)*.32;ctx.fillStyle="#f8e8ef";ctx.fillRect(star.x,star.y,star.size,star.size);}
    const sceneElapsed = time - this.startedAt;
    const reveal = reducedMotion.matches ? 1 : Math.min(1, sceneElapsed / 1800);
    const rotation = this.portraitStarted ? this.lockedRotation : this.userRotation + (reducedMotion.matches ? 0 : sceneElapsed * .000025);
    if (!this.portraitStarted) {
      for (let i = 0; i < this.words.length; i++) {
        if (i / this.words.length > reveal) continue;
        const item = this.words[i];
        const angle = item.angle + item.radius * 5.2 + rotation;
        const x = cx + Math.cos(angle) * item.radius * w * .46;
        const y = cy + Math.sin(angle) * item.radius * h * .39;
        const fadeFromEdge = y < h * .2 || y > h * .8 ? .5 : 1;
        ctx.font = `${item.depth > .78 ? "500 " : "400 "}${item.size}px "Cormorant Garamond", Georgia, serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.globalAlpha = (.48 + item.depth * .42) * fadeFromEdge;
        ctx.shadowBlur = item.depth > .72 ? 5 : 0;
        ctx.shadowColor = `hsla(${item.hue},65%,72%,.6)`;
        ctx.fillStyle = `hsla(${item.hue},55%,${item.depth > .78 ? 83 : 73}%,1)`;
        ctx.fillText(item.text, x, y, 78);
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      this.frame = requestAnimationFrame(next => this.draw(next));
      return;
    }
    const elapsed = time - this.portraitStartTime;
    const rawProgress = reducedMotion.matches ? 1 : Math.max(0, Math.min(1, elapsed / 4200));
    for (let i = 0; i < this.portraitPoints.length; i++) {
      const point = this.portraitPoints[i];
      const item = this.words[i % this.words.length];
      const angle = item.angle + item.radius * 5.2 + rotation;
      const startX = cx + Math.cos(angle) * item.radius * w * .46;
      const startY = cy + Math.sin(angle) * item.radius * h * .39;
      const delay = item.phase * .055;
      const wordProgress = reducedMotion.matches ? 1 : Math.max(0, Math.min(1, (rawProgress - delay) / (1 - delay)));
      const ease = wordProgress * wordProgress * (3 - 2 * wordProgress);
      const dx = point.x - cx, dy = point.y - cy;
      const targetX = cx + dx * Math.cos(rotation) - dy * Math.sin(rotation);
      const targetY = cy + dx * Math.sin(rotation) + dy * Math.cos(rotation);
      const x = startX + (targetX - startX) * ease;
      const y = startY + (targetY - startY) * ease;
      ctx.font = `${7 + point.light * 2}px "Cormorant Garamond", Georgia, serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.globalAlpha = Math.min(1, .35 + wordProgress * .75) * point.alpha;
      ctx.shadowBlur = wordProgress > .9 ? 0 : 7;
      ctx.shadowColor = point.color; ctx.fillStyle = point.color;
      ctx.fillText(point.word, x, y, 24);
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    this.frame=requestAnimationFrame(next=>this.draw(next));
  }
}
document.addEventListener("pointerdown",event=>{
  if(event.target.closest("button,a,label,textarea"))return;
  const heart=document.createElement("span");heart.className="burst-heart";heart.textContent="♥";heart.style.left=`${event.clientX}px`;heart.style.top=`${event.clientY}px`;
  heart.style.setProperty("--dx",`${(Math.random()-.5)*48}px`);heart.style.setProperty("--dy",`${-24-Math.random()*36}px`);
  document.querySelector(".heart-burst").append(heart);heart.addEventListener("animationend",()=>heart.remove(),{once:true});
});
document.getElementById("word-portrait-source").addEventListener("load", () => { if (galaxy) galaxy.preparePortrait(); });
window.addEventListener("pagehide",()=>{ stopGalaxy(); if (galaxy && galaxy.resizeObserver) galaxy.resizeObserver.disconnect(); if (galaxy && galaxy.resizeHandler) window.removeEventListener("resize", galaxy.resizeHandler); });



















