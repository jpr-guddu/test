
            /* ================= FIREBASE ================= */
            firebase.initializeApp({
                apiKey: "AIzaSyBUPXbKjKybtj5w9wYUKLj8F1WbDnwI_PE",
                authDomain: "myfirstproject-a9bd5.firebaseapp.com",
                projectId: "myfirstproject-a9bd5"
            });
            // const db = firebase.firestore();

  

            /* Firestore for School + SSC */
            const db = firebase.firestore();

            // const app = document.getElementById("app");
            const app = document.getElementById("freeQuiz");
            const app1 = document.getElementById("freeQuizes");



            // function loadPage(page){ 
            //     fetch(page) .then(res => res.text()) 
            //     .then(data => { 
            //         document.getElementById("app").innerHTML = data; 
            //         window.scrollTo(0,0); 
            //     }) .catch(() => { 
            //         document.getElementById("app").innerHTML = "<h2>Page not found</h2>"; 
            //     }); 
            // }
            // loadPage('home.html');

            /* ================= TIMER ================= */
            const PER_Q_TIME = 30;
            let timerInterval, qTimerInterval, qTimeLeft;

            /* ================= TOTAL QUIZ TIMER ================= */
            let totalTimeLeft = 0;
            let totalTimerInterval = null;

            const testQuiz = document.getElementById("test&quiz");
            const musti = document.getElementById("musti");
            const info = document.getElementById("info1");


            /* ================= COMMON ================= */
            function createList(p){
                const d=document.createElement("div");
                d.className="list";
                p.appendChild(d);
                return d;
            }

            function createItem(l,t,f){
                const d=document.createElement("div");
                d.className="item";
                d.innerText=t;
                d.onclick=f;
                l.appendChild(d);
            }

        
            /* ================= HOME ================= */
            function goHome(){
                clearInterval(timerInterval);
                clearInterval(qTimerInterval);
                clearInterval(totalTimerInterval); // ✅ ADD
                app.innerHTML="";
                openFreeQuizzes();
            }

            function removeSSC(){
                const s = document.getElementById("sscWrap");
                if(s) s.remove();
            }

            function removeSchool(){
                const s = document.getElementById("schoolWrap");
                if(s) s.remove();
            }


            /* ================================================= */
            /* ================= SCHOOL ======================== */
            /* ================================================= */
            let schoolState={classId:null,subjectId:null,chapterId:null};
            let schoolBC=[], schoolQ=[], schoolI=0, schoolA={}, schoolStatus={};

            function addSchoolNav(w){
                const n=document.createElement("div");
                n.className="topNav";

                const b=document.createElement("button");
                b.innerText="⬅ Back";
                b.onclick=schoolBack;

                const h=document.createElement("button");
                h.innerText="🏠 Home";
                h.onclick=goHome;

                // n.append(b,h);
                n.append(b);// this is updated inside ddSchollNav function from 11th line which show only back Button
                w.prepend(n);
            }

            function schoolBack(){
                if(schoolState.chapterId){
                    schoolState.chapterId=null; schoolBC.pop(); loadChapters();
                }else if(schoolState.subjectId){
                    schoolState.subjectId=null; schoolBC.pop(); loadSubjects();
                }else if(schoolState.classId){
                    schoolState.classId=null; schoolBC.pop(); loadClasses();
                }else goHome();
            }

            function renderSchoolBC(w){
                w.querySelector(".breadcrumb")?.remove();
                const bc=document.createElement("div");
                bc.className="breadcrumb";
                schoolBC.forEach((b,i)=>{
                    const s=document.createElement("span");
                    s.innerText=b.label;
                    s.onclick=()=>{

                        schoolBC=schoolBC.slice(0,i+1);b.action();
                        
                    };
                    bc.appendChild(s);
                    if(i<schoolBC.length-1) bc.innerHTML+=" ➜ ";
                });
                w.prepend(bc);
            }

            function createSchoolSection(){
                const w=document.createElement("div");
                w.id="schoolWrap"; 
                w.className="section";
                app.appendChild(w);
                loadClasses();
            }

            function loadClasses() {
                const w = document.getElementById("schoolWrap");
                // w.innerHTML = "<h2>School Classes</h2>";
                w.innerHTML = "";//this one is also updated to just top line

                // addSchoolNav(w);

                schoolBC = [{ label: "Quiz BSEB", action: loadClasses}];
                renderSchoolBC(w);

                db.collection("classes").get().then(snapshot => {
                    const list = document.createElement("div");
                    list.className = "classList";
                    w.appendChild(list);

                    snapshot.forEach(doc => {
                        const data = doc.data();

                        // 🔹 SUBJECT COUNT
                        db.collection("classes").doc(doc.id).collection("subjects").get()
                        .then(subSnap => {
                            const item = document.createElement("div");
                            item.className = "classItem";

                            item.innerHTML = `
                                <h3 >${data.name}</h3>
                                <p>📚Total Subjects: <b>${subSnap.size}</b></p>
                                <p>🆓All Time Free</p>
                                <button class="startBtn">Start Quiz</button>
                            `;

                            item.querySelector(".startBtn").onclick = () => {
                                schoolState.classId = doc.id;
                                addSchoolNav(w); //This one is  updated from place of third to loadClasses function
                
                                schoolBC.push({
                                    label: data.name,
                                    action: loadSubjects
                                });
                                loadSubjects();
                                // window.location.href = "https://jpr-guddu.github.io/quiz/";
                            };
                            list.appendChild(item);
                        });
                    });
                });
            }

            function loadSubjects(){
                const w = document.getElementById("schoolWrap");
                w.innerHTML = "<h2>Subjects</h2>";
                addSchoolNav(w);
                renderSchoolBC(w);

                const list = document.createElement("div");
                list.className = "subjectList";
                w.appendChild(list);

                db.collection("classes").doc(schoolState.classId).collection("subjects").get()
                .then(subjectSnap => {

                    subjectSnap.forEach(subjectDoc => {
                        const subjectData = subjectDoc.data();
                


                        // 🔹 TOTAL CHAPTER COUNT
                        db.collection("classes").doc(schoolState.classId).collection("subjects").doc(subjectDoc.id)
                        .collection("chapters").get()
                        .then(chapterSnap => {

                            const item = document.createElement("div");
                            item.className = "subjectItem";

                            item.innerHTML = `
                                <h3>${subjectData.name}</h3>
                                <p>📘Total Chapters: <b>${chapterSnap.size}</b></p>
                                <p>🆓All Time Free</p>
                                <button class="startBtn">Start Quiz</button>
                            `;

                            item.querySelector(".startBtn").onclick = () => {
                                schoolState.subjectId = subjectDoc.id;
                                schoolBC.push({
                                    label: subjectData.name,
                                    action: loadChapters
                                });
                                loadChapters();   // CHAPTER PAGE
                            };

                            list.appendChild(item);
                        });
                    });
                });
            }

            function loadChapters(){
                const w = document.getElementById("schoolWrap");
                w.innerHTML = "<h2>Chapters</h2>";
                addSchoolNav(w);
                renderSchoolBC(w);

                const list = document.createElement("div");
                list.className = "chapterList";
                w.appendChild(list);

                db.collection("classes").doc(schoolState.classId).collection("subjects").doc(schoolState.subjectId)
                .collection("chapters").get()
                .then(chapterSnap => {

                    chapterSnap.forEach(chapterDoc => {
                        const chapterData = chapterDoc.data();

                        // 🔹 TOTAL QUESTIONS COUNT
                        db.collection("classes").doc(schoolState.classId).collection("subjects").doc(schoolState.subjectId)
                        .collection("chapters").doc(chapterDoc.id).collection("questions").get()
                        .then(qSnap => {

                            const item = document.createElement("div");
                            item.className = "chapterItem";

                            item.innerHTML = `
                                <h3>${chapterData.name}</h3>
                                <p>❓Total Questions: <b>${qSnap.size}</b></p>
                                <p>🆓All Time Free</p>
                                <button class="startBtn">Start Quiz</button>
                            `;

                            item.querySelector(".startBtn").onclick = () => {
                                schoolState.chapterId = chapterDoc.id;
                                // testQuiz.style.display = "none";
                                info.style.display = "none";

                                schoolBC.push({
                                    label: chapterData.name,
                                    action: loadSchoolQuiz
                                });

                                loadSchoolQuiz(); // QUIZ START
                            };

                            list.appendChild(item);
                        });
                    });
                });
            }

            function loadSchoolQuiz(){
                removeSSC();

                const w=document.getElementById("schoolWrap");
                w.innerHTML="<h2>School Quiz</h2>";
                // addSchoolNav(w); 
                // renderSchoolBC(w);

                schoolQ=[]; schoolI=0; schoolA={}; schoolStatus={};

                db.collection("classes").doc(schoolState.classId).collection("subjects").doc(schoolState.subjectId)
                .collection("chapters").doc(schoolState.chapterId).collection("questions").get().then(s=>{
      
                    s.forEach(d=>schoolQ.push({id:d.id,...d.data()}));

                    // DATA AANE KE BAAD
                    showSchoolQ();
                    startTotalTimer(schoolQ.length, submitSchool);
                });
            }       

            function saveSchoolStatus(){
                const q=schoolQ[schoolI];
                const a=schoolA[q.id];
                if(!a) schoolStatus[schoolI]="skipped";
                else if(a===q.answer) schoolStatus[schoolI]="answered";
                else schoolStatus[schoolI]="wrong";
            }

            function showSchoolQ(){
    
                const w = document.getElementById("schoolWrap");

                let w2 = w.querySelector(".schoolWrap1");
                if(!w2){
                    w2 = document.createElement("div");
                    w2.className = "schoolWrap1";
                    w.appendChild(w2);
                }

                w2.innerHTML = "";

                const q = schoolQ[schoolI];
                if(!q) return;

                /* ================= LEFT : QUESTION ================= */
                const b = document.createElement("div");
                b.className = "questionBox";
                b.innerHTML = `<p>Q${schoolI+1}. ${q.question} </p>`;

                ["A","B","C","D"].forEach(k=>{
                    b.innerHTML += `
                        <label class = "label">
                            <input type="radio" name="school"
                            ${schoolA[q.id] === k ? "checked" : ""}
                            onchange="schoolA['${q.id}']='${k}'">
                            ${q["option"+k]}
                        </label>
                    `;
                });

                /* ================= RIGHT : HEADER / PROGRESS ================= */
                const b2 = document.createElement("div");
                b2.className = "questionBox2";
                createQuizHeader(b2, schoolI, schoolQ.length, schoolStatus);

                /* ================= APPEND SAME ROW ================= */
                w2.appendChild(b);   // left
                w2.appendChild(b2);  // right

                /* ================= TIMER ================= */
                startQuestionTimer(()=>{
                    saveSchoolStatus();
                    schoolI < schoolQ.length-1 ? (schoolI++, showSchoolQ()) : submitSchool();
                });

                /* ================= NAV BUTTON ================= */
                const n = document.createElement("div");
                n.className = "navBtn";

                const pBtn = document.createElement("button");
                pBtn.innerText = "Previous";
                pBtn.disabled = schoolI === 0;
                pBtn.onclick = ()=>{
                    saveSchoolStatus();
                    schoolI--;
                    showSchoolQ();
                };

                const nxBtn = document.createElement("button");
                nxBtn.innerText = schoolI < schoolQ.length-1 ? "Next" : "Submit";
                nxBtn.onclick = ()=>{
                    saveSchoolStatus();
                    schoolI < schoolQ.length-1 ? (schoolI++, showSchoolQ()) : submitSchool();
                };

                /*============= this is updated by Guddu ===============*/
                const rBtn = document.createElement("button");
                rBtn.innerText ="Restart";
                rBtn.onclick = ()=>{
                    restartQuiz();
                }

                n.append(pBtn, nxBtn, rBtn);
                w2.appendChild(n);   // new row
            }

            function submitSchool(){
                clearInterval(totalTimerInterval);
                clearInterval(qTimerInterval);

                let right=0, wrong=0, skip=0;

                schoolQ.forEach(q=>{
                    if(!schoolA[q.id]) skip++;
                    else if(schoolA[q.id]===q.answer) right++;
                    else wrong++;
                });

                const percent = ((right / schoolQ.length) * 100).toFixed(2);

                document.getElementById("schoolWrap").innerHTML=`
                    <h2>Result</h2>
                    <p>✅ Right: ${right}</p>
                    <p>❌ Wrong: ${wrong}</p>
                    <p>⏭ Skipped: ${skip}</p>
                    <h3>📊 Percentage: ${percent}%</h3>
                `;
            }


            // /* ================================================= */
            // /* ================= SSC =========================== */
            // /* ================================================= */
            let sscState={examId:null,subjectId:null,chapterId:null};
            let sscBC=[], sscQ=[], sscI=0, sscA={}, sscReview={}, sscStatus={};

            function addSSCNav(w){
                const n=document.createElement("div");
                n.className="topNav";

                const b=document.createElement("button");

                b.innerText="⬅ Back";
                b.onclick=sscBack;

                const h=document.createElement("button");
                h.innerText="🏠 Home";
                h.onclick=goHome;

                // n.append(b,h);
                n.append(b);// this is updated inside ddSchollNav function from 11th line which show only back Button
                w.prepend(n);
            }

            function sscBack(){
                if(sscState.chapterId){
                    sscState.chapterId=null; sscBC.pop(); loadSSCChapters();
                }else if(sscState.subjectId){
                    sscState.subjectId=null; sscBC.pop(); loadSSCSubjects();
                }else if(sscState.examId){
                    sscState.examId=null; sscBC.pop(); loadSSCExams();
                }else goHome();
            }

            function renderSSCBC(w){
                w.querySelector(".breadcrumb")?.remove();
                const bc=document.createElement("div");
                bc.className="breadcrumb";
                sscBC.forEach((b,i)=>{
                    const s=document.createElement("span");
                    s.innerText=b.label;
                    s.onclick=()=>{sscBC=sscBC.slice(0,i+1);b.action();};
                    bc.appendChild(s);
                    if(i<sscBC.length-1) bc.innerHTML+=" ➜ ";
                });
                w.prepend(bc);
            }

            function createSSCSection(){
                const w=document.createElement("div");
                w.id="sscWrap"; 
                w.className="section";
                app1.appendChild(w);
                loadSSCExams();
            }


            function loadSSCExams(){
                const w = document.getElementById("sscWrap");
                w.innerHTML = "";
                // w.innerHTML = "<h2>SSC Exams</h2>";

                // addSSCNav(w);

                sscBC = [{ label: "SSC", action: loadSSCExams }];
                renderSSCBC(w);

                const list = document.createElement("div");
                list.className = "examList";
                w.appendChild(list);

                db.collection("ssc").get().then(examSnap => {

                    examSnap.forEach(examDoc => {
                        const examData = examDoc.data();

                        // 🔹 TOTAL SUBJECT COUNT
                        db.collection("ssc").doc(examDoc.id).collection("subjects").get()
                        .then(subjectSnap => {

                            const item = document.createElement("div");
                            item.className = "examItem";

                            item.innerHTML = `
                                <h3>${examData.name || examDoc.id}</h3>
                                <p>📚Total Subjects: <b>${subjectSnap.size}</b></p>
                                <p>🆓All Time Free</p>
                                <button class="startBtn">Start Quiz</button>
                            `;

                            item.querySelector(".startBtn").onclick = () => {
                                sscState.examId = examDoc.id;
                                addSSCNav(w); //this one is updated inside loadSSCExams function from third place
                                sscBC.push({
                                    label: examData.name || examDoc.id,
                                    action: loadSSCSubjects
                                });

                                loadSSCSubjects(); // SUBJECT PAGE
                            };
                            list.appendChild(item);
                        });
                    });
                });
            }


            function loadSSCSubjects(){
                const w = document.getElementById("sscWrap");
                w.innerHTML = "<h2>SSC Subjects</h2>";
                addSSCNav(w);
                renderSSCBC(w);

                const list = document.createElement("div");
                list.className = "subjectList";
                w.appendChild(list);

                db.collection("ssc").doc(sscState.examId).collection("subjects").get()
                .then(subjectSnap => {

                    subjectSnap.forEach(subjectDoc => {
                        const subjectData = subjectDoc.data();

                        // 🔹 TOTAL CHAPTER COUNT
                        db.collection("ssc").doc(sscState.examId).collection("subjects")
                        .doc(subjectDoc.id).collection("chapters").get()
                        .then(chapterSnap => {

                            const item = document.createElement("div");
                            item.className = "subjectItem";

                            item.innerHTML = `
                              <h3>${subjectData.name}</h3>
                              <p>📘 Total Chapters: <b>${chapterSnap.size}</b></p>
                              <p>🆓 All Time Free</p>
                              <button class="startBtn">Start Quiz</button>
                            `;
                            item.querySelector(".startBtn").onclick = () => {
                                sscState.subjectId = subjectDoc.id;
                            
                                sscBC.push({
                                    label: subjectData.name,
                                    action: loadSSCChapters
                                });
                                loadSSCChapters();
                            };

                            list.appendChild(item);
                        });
                    });
                });
            }


            function loadSSCChapters(){
                const w = document.getElementById("sscWrap");
                w.innerHTML = "<h2>SSC Chapters</h2>";
                addSSCNav(w);
                renderSSCBC(w);

                const list = document.createElement("div");
                list.className = "chapterList";
                w.appendChild(list);

                db.collection("ssc").doc(sscState.examId).collection("subjects")
                .doc(sscState.subjectId).collection("chapters").get()
                .then(chapterSnap => {

                    chapterSnap.forEach(chapterDoc => {
                        const chapterData = chapterDoc.data();

                        // 🔹 TOTAL QUESTION COUNT
                        db.collection("ssc").doc(sscState.examId).collection("subjects").doc(sscState.subjectId)
                        .collection("chapters").doc(chapterDoc.id).collection("questions").get()
                        .then(qSnap => {

                            const item = document.createElement("div");
                            item.className = "chapterItem";

                            item.innerHTML = `
                                <h3>${chapterData.name}</h3>
                                <p>❓Total Questions: <b>${qSnap.size}</b></p>
                                <p>🆓All Time Free</p>
                                <button class="startBtn">Start Quiz</button>
                            `;

                            item.querySelector(".startBtn").onclick = () => {
                                sscState.chapterId = chapterDoc.id;
                                // testQuiz.style.display="none";

                                sscBC.push({
                                    label: chapterData.name,
                                    action: loadSSCQuiz
                                });

                                loadSSCQuiz(); // QUIZ START
                            };

                            list.appendChild(item);
                        });
                    });
                });
            }


            function loadSSCQuiz(){

                removeSchool();
                const w=document.getElementById("sscWrap");
                w.innerHTML="<h2>SSC Quiz</h2>";
                // addSSCNav(w); 
                // renderSSCBC(w);

                sscQ=[]; sscI=0; sscA={}; sscReview={}; sscStatus={};

                db.collection("ssc").doc(sscState.examId).collection("subjects").doc(sscState.subjectId)
                .collection("chapters").doc(sscState.chapterId).collection("questions").get()
                .then(s=>{
      
                    s.forEach(d=>sscQ.push({id:d.id,...d.data()}));

                    // DATA LOAD KE BAAD
                    showSSCQ();
                    startTotalTimer(sscQ.length, submitSSC);
                });
            }


            function saveSSCStatus(){
                const q=sscQ[sscI];
                const a=sscA[q.id];
                if(!a) sscStatus[sscI]="skipped";
                else if(a===q.answer) sscStatus[sscI]="answered";
                else sscStatus[sscI]="wrong";
            }


            function showSSCQ() {
                const w = document.getElementById("sscWrap");

                let w2 = w.querySelector(".sscWrap1");
                if(!w2){
                    w2 = document.createElement("div");
                    w2.className = "sscWrap1";
                    w.appendChild(w2);
                }

                w2.innerHTML = "";

                const q = sscQ[sscI];
                if(!q) return;

                // Left box
                const b = document.createElement("div");
                b.className = "questionBox";
                b.innerHTML = `<p>Q${sscI+1}. ${q.question}</p>`;
                ["A","B","C","D"].forEach(k=>{
                    b.innerHTML += `
                        <label class="label">
                            <input type="radio" name="ssc"
                            ${sscA[q.id]===k?"checked":""}
                            onchange="sscA['${q.id}']='${k}'">
                            ${q["option"+k]}
                        </label>
                    `;
                });

                // Right box (B2)
                const b2 = document.createElement("div");
                b2.className = "questionBox2";
                createQuizHeader(b2, sscI, sscQ.length, sscStatus);

                w2.appendChild(b);    // left
                w2.appendChild(b2);   // right

                startQuestionTimer(()=>{
                    saveSSCStatus();
                    sscI < sscQ.length-1 ? (sscI++, showSSCQ()) : submitSSC();
                });

                const n = document.createElement("div");
                n.className = "navBtn";
                const pBtn = document.createElement("button");
                pBtn.innerText = "Previous";
                pBtn.disabled = sscI===0;
                pBtn.onclick = ()=>{ saveSSCStatus(); sscI--; showSSCQ(); };

                const nxBtn = document.createElement("button");
                nxBtn.innerText = sscI<sscQ.length-1?"Next":"Submit";
                nxBtn.onclick = ()=>{ saveSSCStatus(); sscI<sscQ.length-1?(sscI++,showSSCQ()):submitSSC(); };

                /*============= this is updated by Guddu ===============*/
                const rBtn = document.createElement("button");
                rBtn.innerText ="Restart";
                rBtn.onclick = ()=>{
                    restartQuiz();
                }

                n.append(pBtn, nxBtn, rBtn);
                w2.appendChild(n);
            }


            // function createQuizHeader(p, i, t, s){

            //     let h = p.querySelector(".quizHeader");

            //     // FIRST TIME CREATE
            //     if(!h){
            //         h = document.createElement("div");
            //         h.className = "quizHeader";
            //         h.innerHTML = `
            //             <div class="qhLeft">
            //                 <div id="qCount"><strong>Q ${i+1}/${t}</strong></div>
            //                 <div>Total Time: <span id="totalTimer"></span></div>
            //             </div>

            //             <div class="qhRight">
            //                 <div>Per Q</div>
            //                 <div id="qTimer">${PER_Q_TIME}s</div>
            //             </div>

            //             <!-- LINEAR PROGRESS -->
            //             <div class="progressContainer">
            //                 <div class="progressFill"></div>
            //             </div>

            //             <!-- DOT PROGRESS -->
            //             <div class="pBar"></div>

                        
            //         `;
            //         p.prepend(h);
            //     }

            //     /* ================= QUESTION COUNT ================= */
            //     h.querySelector("#qCount").innerHTML = `<strong>Q ${i+1}/${t}</strong>`;

            //     /* ================= LINEAR PROGRESS (GREEN LINE) ================= */
            //     const fill = h.querySelector(".progressFill");
            //     const percent = ((i + 1) / t) * 100;   // 🔥 main logic
            //     fill.style.width = percent + "%";

            //     /* ================= DOT PROGRESS ================= */
            //     const bar = h.querySelector(".pBar");
            //     bar.innerHTML = "";

            //     for(let x = 0; x < t; x++){
            //         const d = document.createElement("span");
            //         d.className = "pDot";

            //         if(s[x] === "answered") d.classList.add("answered");
            //         else if(s[x] === "wrong") d.classList.add("wrong");
            //         else if(s[x] === "skipped") d.classList.add("skipped");

            //         if(x === i) d.classList.add("current");

            //         bar.appendChild(d);
            //     }
            // }

function createQuizHeader(p, i, t, s){

    let h = p.querySelector(".quizHeader");

    // FIRST TIME CREATE
    if(!h){
        h = document.createElement("div");
        h.className = "quizHeader";
        h.innerHTML = `
            <div class="qhLeft">
                <div id="qCount"><strong>Q ${i+1}/${t}</strong></div>
                <div>Total Time: <span id="totalTimer"></span></div>
            </div>

            <div class="qhRight">
                <div>Per Q</div>
                <div id="qTimer">${PER_Q_TIME}s</div>
            </div>

            <div class="progressContainer">
                <div class="progressFill"></div>
            </div>

            <div class="pBar"></div>
        `;
        p.prepend(h);
    }

    /* ================= QUESTION COUNT ================= */
    h.querySelector("#qCount").innerHTML = `<strong>Q ${i+1}/${t}</strong>`;

    /* ================= LINEAR PROGRESS ================= */
    const fill = h.querySelector(".progressFill");
    fill.style.width = ((i + 1) / t) * 100 + "%";

    /* ================= DOT PROGRESS (SMART) ================= */
    const bar = h.querySelector(".pBar");
    bar.innerHTML = "";

    for(let x = 0; x < t; x++){
        const d = document.createElement("span");
        d.className = "pDot";
        d.textContent = x + 1;   // 🔢 question number

        /* 🔥 STATUS BASED COLOR + SHAPE */
        if(s[x] === "answered"){
            d.classList.add("answered");     // GREEN
            d.style.transform = "scale(1.15)";
            d.style.borderRadius = "6px";    // shape change
        }
        else if(s[x] === "wrong"){
            d.classList.add("wrong");
            // d.style.borderRadius = "50%";
            d.style.transform = "scale(1.15)";
            d.style.borderRadius = "6px";    // shape change
        }
        else if(s[x] === "skipped"){
            d.classList.add("skipped");
            d.style.opacity = "0.7";
        }

        /* 🔵 CURRENT QUESTION */
        if(x === i){
            d.classList.add("current");
            d.style.outline = "2px solid #2563eb";
        }

        bar.appendChild(d);
    }
}




            function startQuestionTimer(cb){
                clearInterval(qTimerInterval);
                qTimeLeft = PER_Q_TIME;
                const t=document.getElementById("qTimer");

                qTimerInterval=setInterval(()=>{
                    t.innerText = qTimeLeft + "s";
                    if(--qTimeLeft < 0){
                        clearInterval(qTimerInterval);
                        cb();
                    }
                },1000);
            }


            /* ================= RESULT ================= */
            function submitSSC(){
                let c=0,w=0,u=0;
                sscQ.forEach(q=>{
                    if(!sscA[q.id])u++;
                    else if(sscA[q.id]===q.answer)c++;
                    else w++;
                });
                document.getElementById("sscWrap").innerHTML=`
                    <h2>Result</h2>
                    <p>Correct: ${c}</p>
                    <p>Wrong: ${w}</p>
                    <p>Unattempted: ${u}</p>
                    <h3>Score: ${c-(w*0.25)}</h3>
                `;
            }

            // /* ================= ENTRY ================= */
            function openFreeQuizzes(){
                app.innerHTML="";
                createSchoolSection();
                createSSCSection();
            }
            openFreeQuizzes();



            function startTotalTimer(totalQ, submitFn){
                clearInterval(totalTimerInterval);

                totalTimeLeft = totalQ * PER_Q_TIME;

                totalTimerInterval = setInterval(()=>{
                    const tEl = document.getElementById("totalTimer");
                    if(!tEl) return; // 🛡️ safety

                    const min = Math.floor(totalTimeLeft / 60);
                    const sec = totalTimeLeft % 60;

                    tEl.innerText = `${min}:${sec < 10 ? "0"+sec : sec}`;

                    if(--totalTimeLeft < 0){
                        clearInterval(totalTimerInterval);
                        clearInterval(qTimerInterval);
                        submitFn();
                    }
                },1000);
            }

            function hide(){
                const g = document.getElementById("sscWrap");
                const m = document.getElementById("schoolWrap");
                g.style.display = "none";
                m.style.display = "none";
            }

            // const musti = document.getElementById("masti");
            function live(){
                musti.innerHTML="";
            }

            function restartQuiz(){

                /* ================= TIMERS RESET ================= */
                clearInterval(timerInterval);
                clearInterval(qTimerInterval);
                clearInterval(totalTimerInterval);

                timerInterval = null;
                qTimerInterval = null;
                totalTimerInterval = null;
                totalTimeLeft = 0;
                qTimeLeft = PER_Q_TIME;

                /* ================= SCHOOL RESET ================= */
                schoolState = { classId:null, subjectId:null, chapterId:null };
                schoolBC = [];
                schoolQ = [];
                schoolI = 0;
                schoolA = {};
                schoolStatus = {};

                /* ================= SSC RESET ================= */
                sscState = { examId:null, subjectId:null, chapterId:null };
                sscBC = [];
                sscQ = [];
                sscI = 0;
                sscA = {};
                sscReview = {};
                sscStatus = {};

                /* ================= UI RESET ================= */
                app.innerHTML = "";

                if(testQuiz) testQuiz.style.display = "block";
                if(musti) musti.innerHTML = "";

                /* ================= RELOAD HOME ================= */
                openFreeQuizzes();

                console.log("🔄 Quiz Restarted Successfully");
            }

/*======================================================================*/
/*=========================== start Live Quiz ==========================*/
/*======================================================================*/
/*=============================================================================================*/
/* ================================= Live Quiz JavaScript start================================*/
/*=============================================================================================*/
      function startCountdown(endTime, el){
        const timer = setInterval(()=>{
          const diff = endTime - Date.now();
          if(diff <= 0){
            el.innerText = "Time Over";
            clearInterval(timer);
            return;
          }
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000)/60000);
          const s = Math.floor((diff % 60000)/1000);
          el.innerText = `${h}h ${m}m ${s}s left`;
        },1000);
      }

      /* ===== LIVE USERS ===== */
      function listenLiveUsers(quizId, el){
        db.collection("liveQuiz").doc(quizId)
        .collection("liveUsers")
        .onSnapshot(snap=>{
         el.innerText = `👥 ${snap.size} Live Users`;
        });
      }

      /* ===== LOAD QUIZZES ===== */
      async function loadLiveTests(){
        const box = document.querySelector(".liveQuizes");
        box.innerHTML = "Loading...";
  

        const snap = await db.collection("liveQuiz").get();
        box.innerHTML = "";


        snap.forEach(async (docSnap)=>{
          const quizId = docSnap.id;
          const qc = docSnap.data().quizControl || {};

          /* ===== STATUS ===== */
          let status = "Upcoming";
          if(qc.active === true) status = "Live";
          if(qc.active === false && Date.now() > qc.endTime) status = "Ended";

          const statusClass = status==="Live" ? "status-live" : status==="Upcoming" ? "status-upcoming" : "status-ended";

          /* ===== QUESTIONS COUNT (✅ FIX) ===== */
          const qSnap = await db.collection("liveQuiz").doc(quizId).collection("questions").get();

          const qCount = qSnap.size;

          /* ===== CARD ===== */
          const card = document.createElement("div");
          card.className = "liveTestCard";

          card.innerHTML = `
            <h3>${quizId.toUpperCase()}</h3>
            <span class="liveTestStatus ${statusClass}">${status}</span>
            <p>📘 Questions: <b>${qCount}</b></p>
            <p>🕒 Start: ${qc.startTime ? new Date(qc.startTime).toLocaleString("en-IN") : "-"}</p>
            <p>⏰ End: ${qc.endTime ? new Date(qc.endTime).toLocaleString("en-IN") : "-"}</p>
          `;

          /* ===== COUNTDOWN ===== */
          const countdown = document.createElement("div");
          countdown.className = "liveCountdown";
          if(status === "Live"){
            startCountdown(qc.endTime, countdown);
          }else{
            countdown.innerText = "Not Started";
          }
          card.appendChild(countdown);

          /* ===== LIVE USERS ===== */
          const users = document.createElement("div");
          users.className = "liveUsers";
          listenLiveUsers(quizId, users);
          card.appendChild(users);

          /* ===== BUTTON ===== */
          const btn = document.createElement("button");
          btn.innerText = status === "Live" ? "Join Now" : "View";

          btn.onclick = () => {
            if(status !== "Live"){
              alert("Quiz abhi live nahi hai");
              return;
            }
            window.location.href =
            "vimal.html?quizId=" + encodeURIComponent(quizId);
          };

          card.appendChild(btn);
          box.appendChild(card);
        });
      }

      function startQuiz(quizId, status){
        console.log("Starting quiz:", quizId); // debug

        if(status !== "Live"){
          alert("Quiz abhi live nahi hai");
          return;
        }
        // ✅ GUARANTEED quizId pass
        window.location.href = "https://jpr-guddu.github.io/live/?quizId=" + encodeURIComponent(quizId);
      }


      function openSidebar(){
        document.querySelector(".sidebar").classList.add("active");
        document.querySelector(".sidebarOverlay").classList.add("active");
      }

      function closeSidebar(){
        document.querySelector(".sidebar").classList.remove("active");
        document.querySelector(".sidebarOverlay").classList.remove("active");
      }

      loadLiveTests();

