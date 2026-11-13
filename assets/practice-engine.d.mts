export type PracticeQuestion={id:string;text:string;options:string[];correct:number;explanation:string};
export function evaluatePractice(questions:PracticeQuestion[],answers:Record<string,number>):{complete:boolean;correct:number;total:number;items:{id:string;answered:boolean;correct:boolean;explanation:string}[]};
