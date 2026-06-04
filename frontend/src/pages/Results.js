import { useState, useEffect } from 'react';


function Results(){
  const params = new URLSearchParams(window.location.search);
  const score = params.get('score');
  const total = params.get('total');

  const percentage = Math.round((score / total) * 100);

  return(
    <div>
      <h1>Quiz Complete! </h1>
      <p>Your Score: {score} / {total}</p>
      <p>Percentage: {percentage}%</p>

      {percentage >= 80? (
        <p>Excellent! You're Ready for CSE!</p>
     ) : percentage >= 60 ?(
      <p>Good Job! Keep practicing</p>
     ) : (
      <p>Keep Studying! You Got This!</p>
     )
    }

    <button onClick={() => window.location.href = '/'}>Try Again</button>
    </div>
  )
}

export default Results;