const canvas = document.getElementById("canvas");

let context = canvas.getContext("2d");
let start_background_color = "white";
let canvas_box = canvas.getBoundingClientRect();
context.fillStyle = start_background_color;
context.fillRect = (0, 0, canvas.width, canvas.height);

let draw_color = "black";
let draw_width = "2";
let is_drawing = false;

let restore_array = [];
let index = -1;
let game_in_session = false;

function size_canvas() {
  const parent = canvas.closest(".canvas-cont");
  const box = parent.getBoundingClientRect();
  canvas.height = box.height;
  canvas.width = box.width;

  canvas_box = canvas.getBoundingClientRect();
}
window.addEventListener("resize", size_canvas);
size_canvas();

function change_color(element) {
  draw_color = element.style.background;
}

canvas.addEventListener("touchstart", start, false);
canvas.addEventListener("touchmove", draw, false);
canvas.addEventListener("mousedown", start, false);
canvas.addEventListener("mousemove", draw, false);

canvas.addEventListener("touchend", stop, false);
canvas.addEventListener("mouseup", stop, false);
canvas.addEventListener("mouseout", stop, false);

function start(event) {
  is_drawing = true;
  context.beginPath();
  context.moveTo(
    event.clientX - canvas_box.left,
    event.clientY - canvas_box.top
  );
  event.preventDefault();
}

function draw(event) {
  if (is_drawing) {
    context.lineTo(
      event.clientX - canvas_box.left,
      event.clientY - canvas_box.top
    );
    context.strokeStyle = draw_color;
    context.lineWidth = draw_width;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
  }
  event.preventDefault();
}

function stop(event) {
  if (is_drawing) {
    context.stroke();
    context.closePath();
    is_drawing = false;
  }
  event.preventDefault();

  if (event.type != "mouseout") {
    restore_array.push(context.getImageData(0, 0, canvas.width, canvas.height));
    index += 1;
  }
}

function clear_canvas() {
  context.fillStyle = start_background_color;
  context.clearRect(0, 0, canvas.width, canvas.height);

  restore_array = [];
  index = -1;
}

function undo_last() {
  if (index <= 0) {
    clear_canvas();
  } else {
    index -= 1;
    restore_array.pop();
    context.putImageData(restore_array[index], 0, 0);
  }
}

const randomWords = (list) => (sampleSize) => {
  const nonReferenceList = JSON.parse(JSON.stringify(list));

  return new Array(sampleSize).fill().map((v) => {
    return nonReferenceList.splice(
      ~~(Math.random() * nonReferenceList.length),
      1
    );
  });
};

async function game_handler() {
  const btn = document.querySelector(".start-game");
  if (!game_in_session) {
    game_in_session = true;
    btn.innerText = "End round";
    start_game();
  } else {
    game_in_session = false;
    const willContinue = await swal({
      buttons: {
        button1: {
          text: "Continue playing",
          value: true,
        },
        button2: {
          text: "End game",
          value: false,
        },
      },
    });

    if (willContinue) {
      start_game();
      clear_canvas();
      game_in_session = true;
    } else {
      window.location.reload();
    }
  }
}

async function start_game() {
  await swal({
    title: "You will soon be given a prompt",
    text: "Click 'OK' once the guesser has shut their eyes.",
  });

  const words = randomWords([
    "tiger",
    "toaster",
    "jigglypuff",
    "computer",
    "snail",
    "loser",
    "banana",
    "turtle",
    "mountain",
    "clock",
    "frog",
    "moon",
    "robot",
    "coronavirus",
    "kitchen",
  ])(3);

  const value = await swal({
    title: "Pick a word to draw:",
    text: "Make sure the guesser doesn't see what you pick.",
    buttons: words.reduce((t, [c], i) => {
      return {
        ...t,
        ["button" + i]: {
          text: c,
          value: c.toLowerCase(),
        },
      };
    }, {}),
  });

  console.log("Player picked: " + value);

  await swal({
    icon: "success",
    text: "The guesser can now open their eyes and you can start drawing.",
  });
}
