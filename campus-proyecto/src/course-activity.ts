import activities from '../../assets/course-activities.json';
export type CourseActivity=typeof activities[number];
const normalized=(value:string)=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();
export const activityForCourse=(course:string):CourseActivity|undefined=>activities.find(a=>normalized(a.course)===normalized(course));
