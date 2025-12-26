// ===== BOOT mínimo: asegura que el botón "Comenzar" SIEMPRE funcione =====
(function () {
  function safeShowSetup() {
    const start = document.getElementById("start-screen");
    const setup = document.getElementById("setup-screen");
    const game  = document.getElementById("game-screen");
    const end   = document.getElementById("end-screen");

    [start, setup, game, end].forEach(s => s && s.classList.add("hidden"));
    if (setup) setup.classList.remove("hidden");
    window.scrollTo(0, 0);
  }

  function bind() {
    const btn = document.getElementById("enterSetup");
    if (!btn) return;
    btn.onclick = safeShowSetup;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  try {
    const maxSteps = 15;
    const stepPx = 44;

    let teams = [];
    let currentTeam = 0;
    let timeLeft = 900;
    let timerInterval;

    // ✅ 30 preguntas de sostenibilidad (4 opciones)
    const QUESTIONS = [
      { q: "¿Cuál es una ventaja del transporte público frente al coche privado?", o: ["Aumenta el tráfico", "Emite más CO₂", "Reduce emisiones por persona", "Consume más combustible"], a: 2 },
      { q: "¿Qué significa que un edificio sea eficiente energéticamente?", o: ["Usa más luz artificial", "Necesita menos energía para el mismo confort", "Siempre usa gasoil", "No tiene ventanas"], a: 1 },
      { q: "¿Cuál es una fuente de energía renovable?", o: ["Carbón", "Petróleo", "Energía solar", "Gas natural"], a: 2 },
      { q: "¿Qué acción ayuda más a reducir residuos?", o: ["Usar productos de un solo uso", "Reutilizar y reparar", "Tirar todo mezclado", "Comprar más embalaje"], a: 1 },
      { q: "¿Qué gas está muy relacionado con el cambio climático por efecto invernadero?", o: ["Oxígeno", "Dióxido de carbono (CO₂)", "Helio", "Nitrógeno"], a: 1 },
      { q: "¿Qué es el reciclaje?", o: ["Tirar basura al suelo", "Convertir residuos en nuevos materiales", "Quemar residuos siempre", "Enterrarlo todo"], a: 1 },
      { q: "¿Cuál de estos es un hábito de ahorro de energía en casa?", o: ["Dejar luces encendidas", "Usar bombillas LED", "Abrir la nevera mucho rato", "Poner la calefacción al máximo"], a: 1 },
      { q: "¿Qué opción reduce más la huella de carbono en trayectos cortos?", o: ["Ir en avión", "Ir en bicicleta o a pie", "Ir solo en coche", "Dar vueltas antes de llegar"], a: 1 },
      { q: "¿Qué significa “reducir” en las 3R?", o: ["Comprar más cosas", "Generar menos residuos desde el origen", "Romper productos", "Usar más plástico"], a: 1 },
      { q: "¿Qué es la energía eólica?", o: ["Energía del viento", "Energía del carbón", "Energía del petróleo", "Energía de una batería"], a: 0 },

      { q: "¿Qué práctica mejora la eficiencia energética en invierno?", o: ["Ventanas mal selladas", "Aislamiento térmico", "Poner el aire frío", "Abrir puertas todo el tiempo"], a: 1 },
      { q: "¿Qué es la movilidad sostenible?", o: ["Moverse emitiendo lo máximo", "Moverse con menor impacto ambiental", "Moverse solo en coche grande", "Evitar cualquier desplazamiento"], a: 1 },
      { q: "¿Qué residuo suele ir al contenedor azul (si existe en tu zona)?", o: ["Vidrio", "Papel y cartón", "Restos orgánicos", "Pilas"], a: 1 },
      { q: "¿Cuál es un ejemplo de energía renovable en el mar?", o: ["Energía mareomotriz", "Gas natural", "Carbón importado", "Gasolina"], a: 0 },
      { q: "¿Qué acción ayuda a ahorrar agua?", o: ["Duchas más cortas", "Dejar el grifo abierto", "Regar al mediodía en verano", "Lavar el coche cada día"], a: 0 },
      { q: "¿Qué es compostar?", o: ["Mezclar plásticos con vidrio", "Convertir restos orgánicos en abono", "Tirar comida a la basura", "Quemar residuos en casa"], a: 1 },
      { q: "¿Qué es una “huella de carbono”?", o: ["Una marca en el suelo", "Las emisiones asociadas a una actividad", "Un tipo de reciclaje", "Un contenedor especial"], a: 1 },
      { q: "¿Cuál es una forma de reducir emisiones en casa?", o: ["Usar electrodomésticos eficientes", "Calentar con ventanas abiertas", "Poner luces todo el día", "Dejar cargadores siempre enchufados"], a: 0 },
      { q: "¿Qué es el cambio climático?", o: ["Un cambio solo de estaciones", "Una variación a largo plazo del clima", "Un tipo de reciclaje", "Que llueva siempre igual"], a: 1 },
      { q: "¿Cuál de estas opciones es una energía fósil?", o: ["Energía solar", "Energía eólica", "Petróleo", "Energía hidráulica"], a: 2 },

      { q: "¿Qué se considera “economía circular”?", o: ["Usar y tirar", "Mantener productos y materiales en uso el máximo tiempo", "Producir más basura", "Comprar siempre nuevo"], a: 1 },
      { q: "¿Qué acción es mejor para el reciclaje?", o: ["Tirar residuos sucios", "Separar y limpiar envases si es necesario", "Mezclar vidrio con orgánico", "Aplastar pilas"], a: 1 },
      { q: "¿Qué es la eficiencia energética en iluminación?", o: ["Más luz con menos consumo", "Menos luz con más consumo", "Usar solo velas", "Usar lámparas antiguas siempre"], a: 0 },
      { q: "¿Qué opción reduce el desperdicio alimentario?", o: ["Comprar sin planificar", "Planificar menús y aprovechar sobras", "Tirar comida al primer día", "Comprar más de lo que se necesita"], a: 1 },
      { q: "¿Qué es una “energía limpia”?", o: ["La que contamina mucho", "La que reduce emisiones y contaminación", "La que solo usa carbón", "La que siempre depende del petróleo"], a: 1 },
      { q: "¿Qué mejora la calidad del aire en ciudades?", o: ["Más coches diésel", "Más zonas verdes y transporte sostenible", "Más humo industrial", "Más tráfico"], a: 1 },
      { q: "¿Qué es un coche eléctrico?", o: ["Funciona solo con gasolina", "Funciona con energía almacenada en baterías", "Funciona con carbón", "Funciona sin energía"], a: 1 },
      { q: "¿Qué opción es mejor para llevar la compra?", o: ["Bolsas reutilizables", "Bolsas de un solo uso siempre", "Envolver todo en plástico extra", "Tirar el embalaje en la calle"], a: 0 },
      { q: "¿Qué es una auditoría energética?", o: ["Un examen de matemáticas", "Un análisis para mejorar el consumo de energía", "Un tipo de reciclaje", "Una encuesta de transporte"], a: 1 },
      { q: "¿Cuál es un efecto posible del cambio climático?", o: ["Más eventos extremos (olas de calor, sequías)", "Menos variación climática", "Que el sol se apague", "Que el mar desaparezca"], a: 0 },
    ];

    let questionBag = [];
    let currentQuestion = null;
    let answeringLocked = false;

    const logos = ["images/logo1.png","images/logo2.png","images/logo3.png","images/logo4.png"];

    const screens = {
      start: document.getElementById("start-screen"),
      setup: document.getElementById("setup-screen"),
      game:  document.getElementById("game-screen"),
      end:   document.getElementById("end-screen"),
    };

    function showScreen(name){
      Object.values(screens).forEach(s => s.classList.add("hidden"));
      screens[name].classList.remove("hidden");
      window.scrollTo(0,0);
    }

    // ===== Confeti (canvas) =====
    const confettiCanvas = document.getElementById("confetti");
    const ctx = confettiCanvas.getContext("2d");
    let confettiPieces = [];
    let confettiRAF = null;
    let confettiStopTimeout = null;

    function resizeConfetti(){
      confettiCanvas.width = window.innerWidth * devicePixelRatio;
      confettiCanvas.height = window.innerHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    window.addEventListener("resize", resizeConfetti);

    function startConfetti(durationMs = 6000){
      stopConfetti();
      resizeConfetti();

      const w = window.innerWidth;
      const h = window.innerHeight;

      confettiPieces = Array.from({length: 180}, () => ({
        x: Math.random() * w,
        y: -20 - Math.random() * h * 0.2,
        vy: 2 + Math.random() * 4,
        vx: -1 + Math.random() * 2,
        r: 3 + Math.random() * 5,
        rot: Math.random() * Math.PI,
        vrot: (-0.1 + Math.random() * 0.2),
        c: `hsl(${Math.floor(Math.random() * 360)}, 90%, 60%)`,
        a: 0.9
      }));

      const tick = () => {
        ctx.clearRect(0,0,window.innerWidth, window.innerHeight);

        confettiPieces.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vrot;
          p.vx += (-0.02 + Math.random() * 0.04);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.a;
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.r, -p.r/2, p.r*2, p.r);
          ctx.restore();

          if (p.y > h + 40) {
            p.y = -20;
            p.x = Math.random() * w;
            p.vy = 2 + Math.random() * 4;
          }
        });

        confettiRAF = requestAnimationFrame(tick);
      };

      confettiRAF = requestAnimationFrame(tick);
      confettiStopTimeout = setTimeout(stopConfetti, durationMs);
    }

    function stopConfetti(){
      if (confettiRAF) cancelAnimationFrame(confettiRAF);
      confettiRAF = null;
      confettiPieces = [];
      if (confettiStopTimeout) clearTimeout(confettiStopTimeout);
      confettiStopTimeout = null;
      ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
    }

    // ===== Botones =====
    const enterSetupBtn = document.getElementById("enterSetup");
    if (enterSetupBtn) {
      enterSetupBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showScreen("setup");
      });
    }

    document.getElementById("restartBtn").addEventListener("click", () => location.reload());

    const numTeamsSelect = document.getElementById("numTeams");
    const teamsConfig = document.getElementById("teamsConfig");
    numTeamsSelect.addEventListener("change", buildTeamInputs);
    buildTeamInputs();

    function buildTeamInputs(){
      teamsConfig.innerHTML = "";
      const num = Number(numTeamsSelect.value);

      for(let i=0;i<num;i++){
        const row = document.createElement("div");
        row.className = "team-row";

        row.innerHTML = `
          <input id="teamName${i}" placeholder="Nombre equipo ${i+1}">
          <select id="teamImg${i}">
            ${logos.map((l,idx)=>`<option value="${l}">Logo ${idx+1}</option>`).join("")}
          </select>
          <img class="preview" id="preview${i}" src="${logos[0]}" alt="preview">
        `;

        teamsConfig.appendChild(row);
        row.querySelector(`#teamImg${i}`).addEventListener("change", e=>{
          row.querySelector(`#preview${i}`).src = e.target.value;
        });
      }
    }

    document.getElementById("startGame").addEventListener("click", () => {
      teams = [];
      const num = Number(numTeamsSelect.value);

      for(let i=0;i<num;i++){
        teams.push({
          name: (document.getElementById(`teamName${i}`).value || `Equipo ${i+1}`).trim(),
          image: document.getElementById(`teamImg${i}`).value,
          position: 0
        });
      }

      resetQuestionBag();

      showScreen("game");

      currentTeam = 0;
      timeLeft = 900;

      renderTeams();
      updateTurn();
      startTimer();
      showNextQuestion();
    });

    // ===== Preguntas =====
    function resetQuestionBag(){
      questionBag = QUESTIONS.map((_, idx) => idx);
      shuffle(questionBag);
    }

    function getNextQuestion(){
      if (questionBag.length === 0) resetQuestionBag();
      return QUESTIONS[questionBag.pop()];
    }

    function showNextQuestion(){
      currentQuestion = getNextQuestion();
      answeringLocked = false;

      document.getElementById("feedback").textContent = "";
      document.getElementById("question").textContent = currentQuestion.q;

      const optionsWrap = document.getElementById("options");
      optionsWrap.innerHTML = "";

      const letters = ["A","B","C","D"];
      currentQuestion.o.forEach((optText, optIdx) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.type = "button";
        btn.dataset.idx = String(optIdx);
        btn.textContent = `${letters[optIdx]}) ${optText}`;
        btn.addEventListener("click", () => chooseOption(optIdx));
        optionsWrap.appendChild(btn);
      });
    }

    function chooseOption(selectedIdx){
      if (answeringLocked) return;
      answeringLocked = true;

      const correctIdx = currentQuestion.a;
      const letters = ["A","B","C","D"];
      const btns = Array.from(document.querySelectorAll(".option-btn"));
      btns.forEach(b => b.disabled = true);

      const correctBtn = btns.find(b => Number(b.dataset.idx) === correctIdx);
      if (correctBtn) correctBtn.classList.add("correct");

      if (selectedIdx !== correctIdx) {
        const selectedBtn = btns.find(b => Number(b.dataset.idx) === selectedIdx);
        if (selectedBtn) selectedBtn.classList.add("wrong");
      }

      const ok = selectedIdx === correctIdx;

      if (ok) {
        document.getElementById("feedback").textContent = "✅ ¡Correcto!";
      } else {
        document.getElementById("feedback").textContent =
          `❌ Incorrecto. La correcta era ${letters[correctIdx]}) ${currentQuestion.o[correctIdx]}`;
      }

      resolveAnswer(ok);

      setTimeout(() => {
        if (!screens.game.classList.contains("hidden")) showNextQuestion();
      }, 1000);
    }

    // ===== Recorrido =====
    function renderTeams(){
      const track = document.getElementById("teams-track");
      track.innerHTML = "";

      const goal = document.createElement("img");
      goal.src = "images/meta.png";
      goal.className = "goal-icon";
      goal.alt = "Meta";
      goal.style.setProperty("--goal-x", `${maxSteps * stepPx}px`);
      track.appendChild(goal);

      teams.forEach((t)=>{
        const img = document.createElement("img");
        img.src = t.image;
        img.className = "team-icon";
        img.alt = t.name;
        img.style.setProperty("--x", `${t.position * stepPx}px`);
        track.appendChild(img);
      });
    }

    function updateTurn(){
      document.getElementById("turnText").innerText =
        `Turno del equipo ${teams[currentTeam].name}`;
    }

    function resolveAnswer(ok){
      const t = teams[currentTeam];

      if(ok){
        t.position = Math.min(maxSteps, t.position + 1);
        if(t.position >= maxSteps){
          endGame(t.name, false);
          return;
        }
      }else{
        t.position = Math.max(0, t.position - 1);
        currentTeam = (currentTeam + 1) % teams.length;
      }

      renderTeams();
      updateTurn();
    }

    // ===== Timer =====
    function startTimer(){
      clearInterval(timerInterval);
      updateTimerText();

      timerInterval = setInterval(()=>{
        timeLeft--;
        updateTimerText();
        if(timeLeft <= 0){
          clearInterval(timerInterval);
          endByTime();
        }
      }, 1000);
    }

    function updateTimerText(){
      const m = Math.floor(timeLeft / 60);
      const s = timeLeft % 60;
      document.getElementById("timer").innerText =
        `${m}:${s.toString().padStart(2,"0")}`;
    }

    function endByTime(){
      let winner = teams[0];
      for(const t of teams){
        if(t.position > winner.position) winner = t;
      }
      endGame(winner.name, true);
    }

    function endGame(name, byTime){
      clearInterval(timerInterval);
      showScreen("end");

      document.getElementById("winnerText").innerText =
        byTime ? `¡Tiempo! Gana ${name}` : `¡Ha ganado ${name}!`;

      startConfetti(6000);
    }

    function shuffle(arr){
      for(let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    // Inicial
    showScreen("start");
  } catch (e) {
    console.error("❌ Error en script.js:", e);
  }
});
