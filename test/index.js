class game {
    constructor(key) {
        this.key = key;
        this.drawGame();
    }

    drawGame() {
        let boad = '<table>';
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

    choose(posX, posY) {
        $(`#cell-${posX}-${posY}`).css('background-image', `url("./images/${this.key}.png")`);
    }

    clickPos() {
        $('td').click(function (e) { 
            e.preventDefault();
            let id = e.target.id;
            if (id.indexOf('cell') != -1) {
                id = id.replace('cell-', '');
                let pos = id.split('-');
                let [posX, posY] = pos;
                console.log(posX, posY);
            }
        });
    }
}
$(document).ready(function () {
    var g = new game('o');
    
    // g.choose(0,1);
});