(function($){

	function Game(){


		var BOARD_SIZE = 7;
		var board;
		var moves = 0;

		function init(){
			createBoard();
			renderBoard();
			$("#restart, #newGame").click(restartGame);
		}

		function restartGame(){
			if(confirm('Restart game?')){
				moves = 0;
				deleteSavedGame();
				createBoard();
				renderBoard();
				$('.gameover').addClass('hidden');
			}
		}

		function createBoard(){
			var i,j;
			board = new Array(BOARD_SIZE);
			var savedGame = fetchSavedGame();
			if(savedGame == undefined || savedGame == null){
				loadDefaultGame();
			}else{
				if(confirm('Continue from the last played game?')){
					loadSavedGame(savedGame);
				}else{
					deleteSavedGame();	
					loadDefaultGame();
				}	
			}
		}

		function loadDefaultGame(){
			for(i=0; i<BOARD_SIZE; i++){
				board[i] = new Array(BOARD_SIZE);
				for(j=0; j<BOARD_SIZE; j++){
					board[i][j] = isCorner(i,j) ? -1 : 1;
				}
			}
			board[3][3] = 0;
		}

		function loadSavedGame(savedGame){
			moves = savedGame.moves;
			board  = savedGame.board;
		}

		function deleteSavedGame(){
			window.localStorage.removeItem('brainvita');
		}

		function fetchSavedGame(){
			return JSON.parse(window.localStorage.getItem('brainvita'));
		}

		function checkGameStatus(){
			if(isGameOver()){
				setTimeout(function(){
					$('.gameover').removeClass('hidden');
				}, 500);
				
			}
		}

		function saveGame(){
			var brainvita = {
				moves : moves,
				board : board
			};
			window.localStorage.setItem('brainvita', JSON.stringify(brainvita));
		}

		function updateScore(){
			$('.scoreboard').empty().append($('<div>').attr('id', 'moves').addClass('swing animated').html(moves));
		}

		function isCorner(i,j){
			var lEdge = 2, rEdge = BOARD_SIZE - 3;
			return( 
				(i < lEdge && j < lEdge) || // top-left
				(i > rEdge && j < lEdge) || // bottom-left
				(i < lEdge && j > rEdge) || // top-right
				(i > rEdge && j > rEdge)
			);
		}

		function getCellClass(val){
			return {'-1' : 'dead', '0' : 'hole', '1' : 'alive'}[val];
		}


		function renderBoard(){
			var boardElm = $('#board');
			boardElm.empty();
			var i,j, cellClass;
			for(i=0; i<BOARD_SIZE; i++){
				var rowElm = $('<div>').addClass('row');
				for(j=0; j<BOARD_SIZE; j++){
					rowElm.append(renderCell(i,j));
				}
				boardElm.append(rowElm);
			}
			checkGameStatus();
			$('.cell .marble').draggable({
				containment: "#board",
				revert: "invalid",
				start : onDraggibgMarble,
				stop : function(){
					$('.cell.target').removeClass('target');
				}
			});
			updateScore();
		}

		function renderCell(i, j){
			var id = 'x'+ i + '-' + 'y' + j;
			var cellElm = $('<div>').addClass('cell').attr('id', id);
			cellElm.data('x', i).data('y', j);
			cellElm.empty().append($('<span>').addClass('marble'));
			cellElm.addClass(getCellClass(board[i][j]));
			return cellElm;
		}

		function onDraggibgMarble(){
			$(this).css('z-index', 10);
			var cellElm = $(this).parent('.cell');
			var cX = cellElm.data('x');
			var cY = cellElm.data('y');
			var holes = getAvailableHoles(cX, cY);
			$.each(holes, function(i,hole){
				var holeId  = 'x' + hole.x + '-' + 'y' + hole.y;
				$('#' + holeId + '.hole').droppable({
					drop : function(){
						moveMarble($(this).data('x'), $(this).data('y'), cX, cY);
					}
				}).addClass('target');
			});
		}

		function moveMarble(nX, nY, cX, cY){
			board[nX][nY] = 1;
			board[cX][cY] = 0;
			moves += 1;
			var mX, mY;
			if( cX == nX){
				mX = cX;
				mY = Math.min(cY,nY) + 1;
			}else{
				mX = Math.min(cX, nX) + 1;
				mY = cY;
			}
			board[mX][mY] = 0;
			$('#x' + mX + '-y' + mY).find('.marble').animate({
				height: 'toggle',
				width: 'toggle'
			}, 300, renderBoard);
			saveGame();
		}

		function getAvailableHoles(x,y){
			var holes = [];
			isCellExists(x, y-2) && board[x][y-2] == 0 && board[x][y-1] == 1 ? holes.push({x:x, y: y-2}) : null;
			isCellExists(x, y+2) && board[x][y+2] == 0 && board[x][y+1] == 1 ? holes.push({x:x, y: y+2}) : null;
			isCellExists(x-2, y) && board[x-2][y] == 0 && board[x-1][y] == 1 ? holes.push({x:x-2, y: y}) : null;
			isCellExists(x+2, y) && board[x+2][y] == 0 && board[x+1][y] == 1 ? holes.push({x:x+2, y: y}) : null;
			return holes;
		}


		function isCellExists(x,y){
			var val;
			try{
				val = board[x][y];
			}catch(e){
				return false;
			}
			return true;
		}

		function isGameOver(){
			var i,j;
			for(i=0; i < BOARD_SIZE; i++){
				for(j=0; j < BOARD_SIZE; j++){
					if(board[i][j] == 1 && getAvailableHoles(i,j).length > 0){
						return false;
					}
				}
			}
			return true;
		}


		return {
			init : init
		}
	}

	$(Game().init);
	

}(jQuery));