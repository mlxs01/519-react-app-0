/**
 * This file can be used to store types and interfaces for data received from the API.
 * It's good practice to name your interfaces in the following format:
 * IMyInterfaceName - Where the character "I" is prepended to the name of your interface.
 * This helps remove confusion between classes and interfaces.
 */

import internal from "stream";

/**
 * This represents a class as returned by the API
 */
export interface IUniversityClass {
  classId: string;
  title: string;
  description: string;
  meetingTime: string;
  meetingLocation: string;
  status: string;
  semester: string;
}

export interface IUniversityStudents {
  dateEnrolled: string;
  name: string;
  status: string;
  universityID: string;
}

export interface IUniversityAssignments {
  assignmentId: string;
  classId: string;
  date: string;
  weight: number;
}

export interface IUniversityGrades {
  classId: string;
  grades: { [assignment: string]: string };
  name: string;
  studentId: string;
}

interface GradeTableProps {
  studentData: Array<{
    studentId: string;
    studnetName: string;
    classId: string;
    className: string;
    semester: string;
    finalGrade: number;
  }>
}
export default GradeTableProps;

