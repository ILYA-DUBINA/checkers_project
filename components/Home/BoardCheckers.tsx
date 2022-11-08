import React, { FC, useEffect, useState } from "react";
import { Board } from "../../model/Board";
import CellComponent from "./CellComponent";
import { Cell } from "../../model/Cell"
import { Colors } from "../../model/Colors";
import { Player } from "../../model/Player"
import { Figure } from "../../model/figures/Figure";
import Modal from '../Modal/Modal';
import Link from "next/link";

interface BoardProps {
  board: Board;
  setBoard: (board: Board) => void;
  currentPlayer: Player | null;
  currentFigure: Figure | null;
  swapPlayer: (num: string) => void;
  swapFigure: (figure: Figure) => void;
  restart: () => void;
  show: boolean;
  setShow: (show: boolean) => void;
}

const BoardCheckers: FC<BoardProps> = ({board, setBoard, currentPlayer, currentFigure, swapPlayer, swapFigure, restart, show, setShow}) => {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);  
  const [showFirst, setShowFirst] = useState(true);
  const [prevBlack, setPrevBlack] = useState(board.lostBlackFigure?.length);  
  const [prevWhite, setPrevWhite] = useState(board.lostWhiteFigure?.length);  
  let directionEmpty = selectedCell?.figure?.color === Colors.BLACK ? -1 : 1;
  let directionEmptyTwo = selectedCell?.figure?.color === Colors.BLACK ? 1 : -1;        

  function click(cell: Cell){  
    let banOnHitting = true;    

    if(selectedCell && selectedCell !== cell && cell.color !== "black" && selectedCell?.figure?.canMove(cell)){
      
      selectedCell.moveFigure(cell);         
      setSelectedCell(null);

      //? реализация удалении шашки с поля 
      if(((selectedCell.y - cell.y) > 1 && (selectedCell.x - cell.x) < -1  && cell?.figure?.color === 'white') || ((cell.x - selectedCell.x) > 1 && (cell.y - selectedCell.y) > 1 && cell?.figure?.color === 'black')){
        for(let i = cell.x - 1; i > selectedCell.x; i--){
          board.getCell(selectedCell.x, selectedCell.y).deleteFigure(cell, i, cell?.figure?.color === 'white' ? cell.y + directionEmpty++ : cell.y + directionEmpty--);
        }
       
        if(((selectedCell.y - cell.y) > 2 && (selectedCell.x - cell.x) < -2  && cell?.figure?.color === 'white') || ((cell.x - selectedCell.x) > 2 && (cell.y - selectedCell.y) > 2 && cell?.figure?.color === 'black')){
          banOnHitting = false;
        }      
      }         
      if(((selectedCell.x - cell.x) > 1 && (selectedCell.y - cell.y) > 1 && cell?.figure?.color === 'white') || ((selectedCell.y - cell.y) < -1 && (selectedCell.x - cell.x) > 1 && cell?.figure?.color === 'black') ){
        for(let i = cell.x + 1; i < selectedCell.x; i++){
          board.getCell(selectedCell.x, selectedCell.y).deleteFigure(cell, i, cell?.figure?.color === 'white' ? cell.y + directionEmpty++ : cell.y + directionEmpty--);
        }    
        if(((selectedCell.x - cell.x) > 2 && (selectedCell.y - cell.y) > 2 && cell?.figure?.color === 'white') || ((selectedCell.y - cell.y) < -2 && (selectedCell.x - cell.x) > 2 && cell?.figure?.color === 'black') ){
          banOnHitting = false;
        }
      }         
      if(((selectedCell.y - cell.y) > 1 && (selectedCell.x - cell.x) > 1  && cell?.figure?.color === 'black') || ((selectedCell.y - cell.y) < -1 && (selectedCell.x - cell.x) > 1 && cell?.figure?.color === 'white') ){
        for(let i = cell.x + 1; i < selectedCell.x; i++){
          board.getCell(selectedCell.x, selectedCell.y).deleteFigure(cell, i, cell?.figure?.color === 'black' ? cell.y + directionEmptyTwo++ : cell.y + directionEmptyTwo--);
        } 
        if(((selectedCell.y - cell.y) > 2 && (selectedCell.x - cell.x) > 2  && cell?.figure?.color === 'black') || ((selectedCell.y - cell.y) < -2 && (selectedCell.x - cell.x) > 2 && cell?.figure?.color === 'white') ){
          banOnHitting = false;
        }
      }     
      if(((selectedCell.x - cell.x) < -1 && (selectedCell.y - cell.y) > 1 && cell?.figure?.color === 'black') || ((cell.x - selectedCell.x) > 1 && (cell.y - selectedCell.y) > 1 && cell?.figure?.color === 'white') ){
        for(let i = cell.x - 1; i > selectedCell.x; i--){
          board.getCell(selectedCell.x, selectedCell.y).deleteFigure(cell, i, cell?.figure?.color === 'black' ? cell.y + directionEmptyTwo++ : cell.y + directionEmptyTwo--);
        }   
        if(((selectedCell.x - cell.x) < -2 && (selectedCell.y - cell.y) > 2 && cell?.figure?.color === 'black') || ((cell.x - selectedCell.x) > 2 && (cell.y - selectedCell.y) > 2 && cell?.figure?.color === 'white') ){
          console.log('h4')
          banOnHitting = false;
        }
      }          
      if(cell.y === 0 && (cell.x || cell.x === 0) && cell?.figure?.color === 'white'){
        board.getCell(cell.x, 0).deleteFigure(cell, cell.x, 0);
        board.addCheckerQueenWhite(cell.x);        
      }
      if(cell.y === 7 && cell.x && cell?.figure?.color === 'black'){
        board.getCell(cell.x, 7).deleteFigure(cell, cell.x, 7);
        board.addCheckerQueenBlack(cell.x);        
      }

      //? реализация передачи хода между игроками
      if(
        ( ((cell.y + 1)  <= 7 ? cell.board.getCell(cell.x + 1, cell.y + 1)?.isFigure()?.color === 'white' : false) && ((cell.y + 1)  <= 7 ? !cell.board.getCell(cell.x + 1, cell.y + 1)?.isEmpty() : false) && !((cell.y + 2) <= 7 ? cell.board.getCell(cell.x + 2, cell.y + 2)?.isEmpty() : false)) 
        && ( ((cell.y + 1)  <= 7 ? cell.board.getCell(cell.x - 1, cell.y + 1)?.isFigure()?.color === 'white' : false) && ((cell.y + 1)  <= 7 ? !cell.board.getCell(cell.x - 1, cell.y + 1)?.isEmpty() : false) && !((cell.y + 2) <= 7 ? cell.board.getCell(cell.x - 2, cell.y + 2)?.isEmpty() : false))
        // || 
        // ( ((cell.y - 1)  >= 0 ? cell.board.getCell(cell.x + 1, cell.y - 1)?.isFigure()?.color === 'black' : false) && ((cell.y - 1)  >= 0 ? !cell.board.getCell(cell.x + 1, cell.y - 1)?.isEmpty() : false) && !((cell.y - 2)  >= 0 ? cell.board.getCell(cell.x + 2, cell.y - 2)?.isEmpty() : false)) 
        // && ( ((cell.y - 1)  >= 0 ? cell.board.getCell(cell.x - 1, cell.y - 1)?.isFigure()?.color === 'black' : false) && ((cell.y - 1)  >= 0 ? !cell.board.getCell(cell.x - 1, cell.y - 1)?.isEmpty() : false) && !((cell.y - 2)  >= 0 ? cell.board.getCell(cell.x - 2, cell.y - 2)?.isEmpty() : false))
        ){
          console.log('1')
          swapPlayer('three');
        } else
      if(        ( ((cell.y - 1)  >= 0 ? cell.board.getCell(cell.x + 1, cell.y - 1)?.isFigure()?.color === 'black' : false) && ((cell.y - 1)  >= 0 ? !cell.board.getCell(cell.x + 1, cell.y - 1)?.isEmpty() : false) && !((cell.y - 2)  >= 0 ? cell.board.getCell(cell.x + 2, cell.y - 2)?.isEmpty() : false)) 
        && ( ((cell.y - 1)  >= 0 ? cell.board.getCell(cell.x - 1, cell.y - 1)?.isFigure()?.color === 'black' : false) && ((cell.y - 1)  >= 0 ? !cell.board.getCell(cell.x - 1, cell.y - 1)?.isEmpty() : false) && !((cell.y - 2)  >= 0 ? cell.board.getCell(cell.x - 2, cell.y - 2)?.isEmpty() : false))){
          console.log('2')
          swapPlayer('two');
        } 

      if(
        ((board.lostBlackFigure?.length > prevBlack && banOnHitting && (((cell.y + 2) <= 7 ? cell.board.getCell(cell.x + 2, cell.y + 2)?.isEmpty() : false) && !cell.board.getCell(cell.x + 1, cell.y + 1)?.isEmpty() && cell.board.getCell(cell.x + 1, cell.y + 1)?.isFigure().color === 'black'))
        || (board.lostWhiteFigure?.length > prevWhite && banOnHitting && ( ((cell.y + 2) <= 7 ? cell.board.getCell(cell.x + 2, cell.y + 2)?.isEmpty() : false) && !cell.board.getCell(cell.x + 1, cell.y + 1)?.isEmpty() && cell.board.getCell(cell.x + 1, cell.y + 1)?.isFigure().color === 'white')))
        ||
        ((board.lostBlackFigure?.length > prevBlack && banOnHitting && ( ((cell.y - 2) >= 0 ? cell.board.getCell(cell.x + 2, cell.y - 2)?.isEmpty() : false) && !cell.board.getCell(cell.x + 1, cell.y - 1)?.isEmpty() && cell.board.getCell(cell.x + 1, cell.y - 1)?.isFigure().color === 'black'))
        || (board.lostWhiteFigure?.length > prevWhite && banOnHitting && (((cell.y - 2) >= 0 ? cell.board.getCell(cell.x + 2, cell.y - 2)?.isEmpty() : false) && !cell.board.getCell(cell.x + 1, cell.y - 1)?.isEmpty() && cell.board.getCell(cell.x + 1, cell.y - 1)?.isFigure().color === 'white')))
        || 
        ((board.lostBlackFigure?.length > prevBlack && banOnHitting && ( ((cell.y - 2) >= 0 ? cell.board.getCell(cell.x - 2, cell.y - 2)?.isEmpty() : false) && !cell.board.getCell(cell.x - 1, cell.y - 1)?.isEmpty() && cell.board.getCell(cell.x - 1, cell.y - 1)?.isFigure().color === 'black'))
        || (board.lostWhiteFigure?.length > prevWhite && banOnHitting && (((cell.y - 2) >= 0 ? cell.board.getCell(cell.x - 2, cell.y - 2)?.isEmpty() : false) && !cell.board.getCell(cell.x - 1, cell.y - 1)?.isEmpty() && cell.board.getCell(cell.x - 1, cell.y - 1)?.isFigure().color === 'white')))
        ||
        ((board.lostBlackFigure?.length > prevBlack && banOnHitting && (((cell.y + 2) <= 7 ? cell.board.getCell(cell.x - 2, cell.y + 2)?.isEmpty() : false) && !cell.board.getCell(cell.x - 1, cell.y + 1)?.isEmpty() && cell.board.getCell(cell.x - 1, cell.y + 1)?.isFigure().color === 'black'))
        || (board.lostWhiteFigure?.length > prevWhite && banOnHitting && ( ((cell.y + 2) <= 7 ? cell.board.getCell(cell.x - 2, cell.y + 2)?.isEmpty() : false) && !cell.board.getCell(cell.x - 1, cell.y + 1)?.isEmpty() && cell.board.getCell(cell.x - 1, cell.y + 1)?.isFigure().color === 'white')))
        )
      {
        swapPlayer('four');
        swapFigure(cell?.figure);
        setPrevBlack(board.lostBlackFigure?.length)
        setPrevWhite(board.lostWhiteFigure?.length)
      } else {
        swapPlayer('one');
        swapFigure(null);
        setPrevBlack(board.lostBlackFigure?.length)
        setPrevWhite(board.lostWhiteFigure?.length)
      }

      //? очистка подсветки вражеских шашек
      board.highlightCellsColor();      
    } else {
      if(cell.figure?.id === currentFigure?.id || cell.figure?.color === currentPlayer?.color) {
        setSelectedCell(cell);
      }
    }            
  }

  useEffect(() => {
    highlightCells();     
  }, [selectedCell])

  function highlightCells() {
    board.highlightCells(selectedCell);
    updateBoard();
  }

  function updateBoard() {
    const newBoard = board.getCopyBoard();
    setBoard(newBoard);
  }

  return (    
    <div className="page__checkers">
      { 
        board.lostWhiteFigure?.length === 12 || board.lostBlackFigure?.length === 12 ? 
        //? блок победы игрока
        <div className="checkers__win">
          <h2 className="checkers__win-title">
            Поздравляем {board.lostWhiteFigure?.length === 12 ? <span className="win-title__black">Черного</span> : <span>Белого</span>} игрока с победой!!!
          </h2>        
          <div className='wrap'>
          <div className='firework'>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          </div>
          <div className='firework'>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          </div>
          <div className='firework'>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          </div>
          <div className='firework'>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          </div>
          <div className='firework'>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          </div>
          <div className='firework'>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          </div>
          <div className='firework'>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          </div>
          <div className='firework'>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          </div>
          <div className='firework'>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          </div>
          <div className='firework'>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          <div className='c'></div>
          </div>
          </div>
          <div className="checkers__win-buttons">
            <button className="win-button__left" onClick={restart}>Продолжить игру</button>
            <button className="win-button__right"><Link href={'/'}>Выйти на главную</Link></button>
          </div>
  
        </div>
      :    
        //? основной блок
        <div className="checkers">     
          <div className="checkers__left-count">
            <h3 className="left-count__title">Текущий счет сбитых <br/> белых шашек</h3>
            <span className="left-count__number">{board.lostWhiteFigure?.length}</span>
          </div>
          <div className="checkers__numbers-left">
            <ul>
              <li>
                 1
              </li>
              <li>
                 2
              </li>
              <li>
                 3
              </li>
              <li>
                 4
              </li>
              <li>
                 5
              </li>
              <li>
                 6
              </li>
              <li>
                 7
              </li>
              <li>
                 8
              </li>
            </ul>
          </div>
          <div className="checkers__content">
            { currentFigure ? <h3 className="checkers__content-title">Текущий ход <span className="checkers__content-title__player" style={currentFigure?.color === 'white' ? { color: 'white', fontSize: '30px'} : { color: 'black', fontSize: '30px'}}>{currentFigure?.color === 'white' ? 'Белого' : 'Черного'}</span> игрока </h3>
                            : <h3 className="checkers__content-title">Текущий ход <span className="checkers__content-title__player" style={currentPlayer?.color === 'white' ? { color: 'white', fontSize: '30px'} : { color: 'black', fontSize: '30px'}}>{currentPlayer?.color === 'white' ? 'Белого' : 'Черного'}</span> игрока </h3>}
            <div className="checkers__letters-up">
              <ul>
                <li>
                  A
                </li>
                <li>
                  B
                </li>
                <li>
                  C
                </li>
                <li>
                  D
                </li>
                <li>
                  E
                </li>
                <li>
                  F
                </li>
                <li>
                  G
                </li>
                <li>
                  H
                </li>
              </ul>
            </div>
            {/* модалка */}
            <div className="checkers__modal">
                <button className="checkers__modal-button" onClick={() => {setShow(true), setShowFirst(false)}}>Правила игры</button>
                <Modal title={showFirst ? "Уважаемый игрок, перед началом игры ознакомьтесь пожалуйста с правилами!" : "Правила игры"} onClose={() => setShow(false)} show={show}>
                  <p>Бла-бла-бла-бла</p>
                </Modal>
            </div>
            <div className="board">
              {board.cells.map((row, index) => (
                <React.Fragment key={index}>
                  {row.map((cell) => (
                    <CellComponent 
                      click={click}
                      cell={cell} 
                      key={cell.id}
                      selected={cell.x === selectedCell?.x && cell.y === selectedCell?.y} 
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
            <div className="checkers__letters-down">
              <ul>
                <li>
                  A
                </li>
                <li>
                  B
                </li>
                <li>
                  C
                </li>
                <li>
                  D
                </li>
                <li>
                  E
                </li>
                <li>
                  F
                </li>
                <li>
                  G
                </li>
                <li>
                  H
                </li>
              </ul>
            </div>
          </div>  
          <div className="checkers__numbers-right">
            <ul>
              <li>
                 1
              </li>
              <li>
                 2
              </li>
              <li>
                 3
              </li>
              <li>
                 4
              </li>
              <li>
                 5
              </li>
              <li>
                 6
              </li>
              <li>
                 7
              </li>
              <li>
                 8
              </li>
            </ul>
          </div> 
          <div className="checkers__right-count">
            <h3 className="right-count__title">Текущий счет сбитых <br/> <span>черных</span> шашек</h3>
            <span className="right-count__number">{board.lostBlackFigure?.length}</span>
          </div>
        </div>
      }  
    </div>
  )
}

export default BoardCheckers;