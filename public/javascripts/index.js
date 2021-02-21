class play {
    constructor(key) {
        this.key = key;
        this.drawGame();
        this.listenNewGame();
        this.clickPos();
        this.win = false;
    }

    askReplay() {
        let cfm = window.confirm("The enemy asked to play again");
        if (cfm) {
            socket.emit("accept replay");
        }
    }

    listenNewGame() {
        $("#new-game").click( e => {
            socket.emit("replay request", this.key);
        });
    }

    newGame() {
        $(".x").removeClass("x");
        $(".o").removeClass("o");
        $(".choose-cell").removeClass("choose-cell");
    }

    show() {
        $("#boad").css("display", "block");
        window.scrollTo(500, 500);
    }

    hide() {
        $("#boad").css("display", "none");
    }

    drawGame() {
        
        $("#code").html(this.key.toUpperCase());
        let boad = '<table id="tb">';
        for (let i =0 ; i < CELL_QUALITY; i++) {
            boad += '<tr>';
            for (let j = 0; j < CELL_QUALITY; j++) {
                boad += `<td id="cell-${i}-${j}"></td>`;
            }
            boad += '</tr>';
        }
        boad += '</table>';

        $('#boad').html(boad);
        $('table').css('width', CELL_QUALITY*CELL_SIZE);
        $('td').css('height', CELL_SIZE);
        $('td').css('width', CELL_SIZE);
    }

    choose(posX, posY, key) {
        // $(`#cell-${posX}-${posY}`).css('background-image', `url("./images/${key}.png")`);
        if ($(".choose-cell")) {
            $(".choose-cell").removeClass("choose-cell");
        }
        $(`#cell-${posX}-${posY}`).addClass(key);
        $(`#cell-${posX}-${posY}`).addClass("choose-cell");

        this.isWinner(posX, posY);
        if (this.win) {
            socket.emit("am winner");
        }
    }

    clickPos() {
        $('td').click(function (e) { 
            let id = e.target.id;
            if (id.indexOf('cell') != -1) {
                id = id.replace('cell-', '');
                let pos = id.split('-');
                let [posX, posY] = [Number(pos[0]), Number(pos[1])];
                socket.emit("clickBoad", {posX, posY});
            }
        });
    }

    checkVerticalLine(posX, posY) {
        let line = [];
        for (let i = 0; i < 5; i++) {
            let cell = $(`#cell-${posX-i}-${posY}`);
            if (!cell) break;
            if (cell.hasClass(this.key)) {
                line.push({
                    x: posX,
                    y: posY
                });
            } else {
                break;
            }
        }
        for (let i = 1; i < 6; i++) {
            let cell = $(`#cell-${posX+i}-${posY}`);
            if (!cell) break;
            if (cell.hasClass(this.key)) {
                line.push({
                    x: posX,
                    y: posY
                });
            } else {
                break;
            }
        }
        if (line.length < 5) {
            return false;
        } else {
            return true;
        }
    }

    checkHorizonLine(posX, posY) {
        var line = [];
        for (let i = 0; i < 5; i++) {
            let cell = $(`#cell-${posX}-${posY-i}`);
            if (!cell) break;
            if (cell.hasClass(this.key)) {
                line.push({
                    x: posX,
                    y: posY
                });
            } else {
                break;
            }
        }
        for (let i = 1; i < 6; i++) {
            let cell = $(`#cell-${posX}-${posY+i}`);
            if (!cell) break;
            if (cell.hasClass(this.key)) {
                line.push({
                    x: posX,
                    y: posY
                });
            } else {
                break;
            }
        }
        // console.log(line);
        if (line.length < 5) {
            return false;
        } else {
            return true;
        }
    }

    checkLeftDiagonalLine(posX, posY) {
        let line = [];
        for (let i = 0; i < 5; i++) {
            let cell = $(`#cell-${posX-i}-${posY-i}`);
            if (!cell) break;
            if (cell.hasClass(this.key)) {
                line.push({
                    x: posX,
                    y: posY
                });
            } else {
                break;
            }
        }
        for (let i = 1; i < 6; i++) {
            let cell = $(`#cell-${posX+i}-${posY+i}`);
            if (!cell) break;
            if (cell.hasClass(this.key)) {
                line.push({
                    x: posX,
                    y: posY
                });
            } else {
                break;
            }
        }
        // console.log(line);
        if (line.length < 5) {
            return false;
        } else {
            return true;
        }
    }

    checkRightDiagonalLine(posX, posY) {
        let line = [];
        for (let i = 0; i < 5; i++) {
            let cell = $(`#cell-${posX+i}-${posY-i}`);
            if (!cell) break;
            if (cell.hasClass(this.key)) {
                line.push({
                    x: posX,
                    y: posY
                });
            } else {
                break;
            }
        }
        for (let i = 1; i < 6; i++) {
            let cell = $(`#cell-${posX-i}-${posY+i}`);
            if (!cell) break;
            if (cell.hasClass(this.key)) {
                line.push({
                    x: posX,
                    y: posY
                });
            } else {
                break;
            }
        }

        // console.log(line);
        if (line.length < 5) {
            return false;
        } else {
            return true;
        }
    }

    isWinner(posX, posY) {
        if($(`#cell-${posX}-${posY}`).hasClass(this.key)) {
            if (
                this.checkHorizonLine(posX, posY) ||
                this.checkVerticalLine(posX, posY) ||
                this.checkLeftDiagonalLine(posX, posY) ||
                this.checkRightDiagonalLine(posX, posY)
            ) {
                this.win = true;
            }
        }
    }

}

class menu {
    constructor(id) {
        this.idGame = id;
        this.submit();
    }
    show() {
        $("#menu").css("display", "block")
        if ($('#menu')) {
            $('#id-game').html(this.idGame);
            $("#id-partner").val("");
        }
    }

    hide() {
        $("#menu").css("display", "none");
    }

    updateRooms(newRoom) {
        let roomList = "";
        newRoom.forEach( e => {
            roomList += `<option>${e.id}</option>`
        });
        $("#room-list").html(roomList);
        $("option").click( e => {
            $("#id-partner").val(e.target.innerHTML);
        })
    }

    submit() {
        $('form').submit(function (e) { 
            e.preventDefault();
            let room = $("#id-partner").val();
            if (room == '') {
                room = $('#id-game').html();
            }
            socket.emit("send id game", room);
        });
    }
}

class chat {
    constructor() {
        this.send();
        this.messages = [];
    }

    show() {
        $("#chat").css("display", "block");
    }

    hide() {
        $("#chat").css("display", "none");
    }

    send() {
        $("#chat-form").submit( e => {
            e.preventDefault();
            socket.emit("send message", $("#msg").val());
            // console.log($("#msg").val());
            $("#msg").val("");
        })
    }

    readMsg(msg) {
        if (this.messages[this.messages.length-1] != msg) {
            let content = `<h6>[ ${msg} ]</h6>` + $("#content").html();
            $("#content").html(content);
            this.messages.push(msg);
        }
    }
}

const socket = io();
$(document).ready(function () {
    var m, g, c;
    socket.on("show menu", data => {
        m = new menu(data);
        m.show();
    });
    socket.on("play", key => {
        m.hide();
        g = new play(key);
        g.show();
        c = new chat();
        c.show();
    });
    socket.on("choose", data => {
        g.choose(data.posX, data.posY, data.key);
    });
    socket.on("partner leave", () => {
        g.hide();
        c.hide();
        m.show();
        alert("Your enemy has surrendered");
    });
    socket.on("get rooms", rooms => {
        m.updateRooms(rooms);
    });
    socket.on("rooms update", rooms => {
        m.updateRooms(rooms);
    });
    socket.on("client leave", rooms => {
        m.updateRooms(rooms);
    });
    socket.on("win", () => {
        alert("you win");
    });
    socket.on("lose", () => {
        alert("you lose");
    });

    socket.on("please replay", () => {
        g.askReplay();
    });
    socket.on("new game", () => {
        g.newGame();
    });

    socket.on("take msg", msg => {
        // console.log(msg);
        c.readMsg(msg);
    })
});