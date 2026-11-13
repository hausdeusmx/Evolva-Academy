export function evaluatePractice(questions, answers) {
  const items=questions.map(q=>({id:q.id,answered:Number.isInteger(answers[q.id])&&answers[q.id]>=0&&answers[q.id]<q.options.length,correct:answers[q.id]===q.correct,explanation:q.explanation}));
  return {complete:items.every(q=>q.answered),correct:items.filter(q=>q.correct).length,total:items.length,items};
}
