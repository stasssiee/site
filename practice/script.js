function getShownQuestions() {
  return JSON.parse(localStorage.getItem("shownQuestions") || "{}");
}

function saveShownQuestions(data) {
  localStorage.setItem("shownQuestions", JSON.stringify(data));
}

let questionData = {};
let shownQuestions = getShownQuestions();

// Mapping of course names to separate JSON files
const courseFiles = {
  "Differential Equations": "courses/Differential Equations.json",
  "Linear Algebra": "courses/Linear Algebra.json",
  "Calculus III": "courses/Calculus III.json",
  "Discrete Mathematics": "courses/Discrete Mathematics.json",
  "AP Calculus BC": "courses/AP Calculus BC.json",
  "AP Statistics": "courses/AP Statistics.json",
  "AP Chemistry": "courses/AP Chemistry.json",
};

// Populate course dropdown on page load
document.addEventListener("DOMContentLoaded", populateCourses);

function fixRelativeImagePaths(html) {
  return html.replace(/<img\s+[^>]*src=["'](images\/[^"']+)["']/gi, (match, p1) => {
    return match.replace(p1, `courses/${p1}`);
  });
}


function populateCourses() {
  const courseSelect = document.getElementById("courseSelect");
  courseSelect.innerHTML = "<option value=''>-- Select Course --</option>";
  Object.keys(courseFiles).forEach(course => {
    const opt = document.createElement("option");
    opt.value = course;
    opt.textContent = course;
    courseSelect.appendChild(opt);
  });
}

function updateUnits() {
  const course = document.getElementById("courseSelect").value;
  const unitSelect = document.getElementById("unitSelect");
  unitSelect.innerHTML = "<option value=''>-- Select Unit --</option>";

  if (!course) return;

  fetch(courseFiles[course])
    .then(response => response.json())
    .then(data => {
      questionData = { [course]: data };
      Object.keys(data).forEach(unit => {
        const opt = document.createElement("option");
        opt.value = unit;
        opt.textContent = unit;
        unitSelect.appendChild(opt);
      });

      document.getElementById("questionCard").style.display = "none";
      document.getElementById("nextQuestionBtn").style.display = "none";
      document.getElementById("questionCount").textContent = "";
    });
}

function unescapeMathjax(str) {
  if (!str) return "";
  return str.replace(/\\\\\(/g, '\\(').replace(/\\\\\)/g, '\\)');
}

function displayRandomQuestion() {
  const course = document.getElementById("courseSelect").value;
  const unit = document.getElementById("unitSelect").value;
  const key = `${course}||${unit}`;
  const questions = questionData[course]?.[unit];

  if (!questions || questions.length === 0) {
    hideCardWithMessage("No questions available.");
    return;
  }

  shownQuestions = getShownQuestions();
  const used = shownQuestions[key] || [];

  if (used.length === questions.length) {
    hideCardWithMessage("No more questions left for this unit.");
    return;
  }

  let index;
  do {
    index = Math.floor(Math.random() * questions.length);
  } while (used.includes(index));

  used.push(index);
  shownQuestions[key] = used;
  saveShownQuestions(shownQuestions);

  const q = questions[index];
  const questionDisplay = document.getElementById("questionDisplay");
  const answerDisplay = document.getElementById("answerDisplay");

  questionDisplay.innerHTML = fixRelativeImagePaths(unescapeMathjax(q.question));

  // Remove old question image
const oldQImg = document.getElementById("questionImage");
if (oldQImg) oldQImg.remove();

// Add question image
if (q.image) {
  const img = document.createElement("img");
  img.id = "questionImage";
  img.src = `courses/${q.image}`;
  img.style.maxWidth = "80%";
  img.style.margin = "20px auto";
  img.style.display = "block";
  img.alt = "Question image";
  questionDisplay.appendChild(img);
}

// Set answer content
answerDisplay.innerHTML = fixRelativeImagePaths(unescapeMathjax(q.answer));
answerDisplay.style.display = "none";

// Remove old answer image
const oldAImg = document.getElementById("answerImage");
if (oldAImg) oldAImg.remove();

// Add answer image
if (q.answerImage) {
  const img = document.createElement("img");
  img.id = "answerImage";
  img.src = `courses/${q.answerImage}`;
  img.style.maxWidth = "80%";
  img.style.margin = "20px auto";
  img.style.display = "block";
  img.alt = "Answer image";
  answerDisplay.appendChild(img);
}

  document.getElementById("questionCard").style.display = "block";
  document.getElementById("nextQuestionBtn").style.display = "inline-block";

  updateQuestionCount();
  MathJax.typesetPromise();
}

function toggleAnswer() {
  const answer = document.getElementById("answerDisplay");
  answer.style.display = answer.style.display === "none" ? "block" : "none";
  MathJax.typesetPromise();
}

function hideCardWithMessage(message) {
  document.getElementById("questionCard").style.display = "block";
  document.getElementById("questionDisplay").innerHTML = `<p>${message}</p>`;
  document.getElementById("answerDisplay").style.display = "none";
  document.getElementById("nextQuestionBtn").style.display = "none";
}

function resetShownQuestions() {
  localStorage.removeItem("shownQuestions");
  shownQuestions = {};
  alert("Question history reset.");
  updateQuestionCount();
}

function updateQuestionCount() {
  const course = document.getElementById("courseSelect").value;
  const unit = document.getElementById("unitSelect").value;
  const countDisplay = document.getElementById("questionCount");

  if (!course || !unit || !questionData[course]?.[unit]) {
    countDisplay.textContent = "";
    return;
  }

  const all = questionData[course][unit];
  const used = getShownQuestions()[`${course}||${unit}`] || [];
  const remaining = all.length - used.length;

  countDisplay.textContent = `Questions left in this unit: ${remaining} of ${all.length}`;
}
