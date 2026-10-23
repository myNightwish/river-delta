// Only derives the requested range from the server-computed total score.
export function toleranceBounds(score,percent=30){
 if(score===''||score===null||score===undefined||!Number.isFinite(Number(score)))return ['','']
 const cents=Math.round(Number(score)*100)
 return [Math.floor((cents*(100-percent)+50)/100)/100,Math.floor((cents*(100+percent)+50)/100)/100]
}
