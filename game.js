(function($){

	var BOARD_SIZE = 7;
	var board;

	function init(){
		createBoard();
		renderBoard();
	}

	function createBoard(){
		var i,j;
		board = new Array(BOARD_SIZE);
		for(i=0; i<BOARD_SIZE; i++){
			board[i] = new Array(BOARD_SIZE);
			for(j=0; j<BOARD_SIZE; j++){
				board[i][j] = isCorner(i,j) ? -1 : 1;
			}
		}
		board[3][3] = 0;
	}

	function checkGameStatus(){
		if(isGameOver()){
			alert('Game Over');
		}else{
			console.log('Not over yet');
		}
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


	function renderBoard(){
		var boardElm = $('#board');
		boardElm.empty();
		var i,j, cellClass;
		for(i=0; i<BOARD_SIZE; i++){
			var rowElm = $('<div>').addClass('row');
			for(j=0; j<BOARD_SIZE; j++){
				var id = 'x'+ i + '-' + 'y' + j;
				var cellElm = $('<div>').addClass('cell').attr('id', id);
				cellElm.data('x', i).data('y', j);
				cellElm.empty().append($('<span>').addClass('marble'));
				switch(board[i][j]){
					case -1:
						cellClass = 'dead';
						break;
					case 0:
						cellClass = 'hole';
						break;
					case 1:
						cellClass = "alive";
						break;
				}
				cellElm.addClass(cellClass);
				rowElm.append(cellElm);
			}
			boardElm.append(rowElm);
		}
		checkGameStatus();
		$('.marble').draggable({
			containment: "#board",
			revert: "invalid",
			start : function(){
				var cellElm = $(this).parent('.cell');
				var cX = cellElm.data('x');
				var cY = cellElm.data('y');
				var holes = getAvailableHoles(cX, cY);
				$.each(holes, function(i,hole){
					var holeId  = 'x' + hole.x + '-' + 'y' + hole.y;
					$('#' + holeId + '.hole').droppable({
						drop : function(){
							var nX = $(this).data('x'), nY = $(this).data('y');
							board[nX][nY] = 1;
							board[cX][cY] = 0;
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
						}
					});
				});
			}
		});
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

	$(init);
	

}(jQuery));