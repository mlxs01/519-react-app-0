import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { Select, Typography, MenuItem } from "@mui/material";

/**
 * You will find globals from this file useful!
 */
import { MY_BU_ID, BASE_API_URL, SEMESTER, GET_DEFAULT_HEADERS } from "./globals";
import { IUniversityClass, IUniversityAssignments} from "./types/api_types";
import GradeTable from "./components/GradeTable";
import GradeTableProps from "./types/api_types";

function App() {
  // You will need to use more of these!
  const [currClassId, setCurrClassId] = useState<string>(""); // Ever changing
  const [currClassName, setCurrClassName] = useState<string>(""); // Based on what User clicks
  const [currData, setData] = useState<GradeTableProps["studentData"]>([]); // Holds the data for Data Table
  const [allGrades, setGrades] = useState<number[]>([]); // All the grades for that class
  const [allClassIds, setClassIds] = useState<string[]>([]); // const on load in
  const [allClassNames, setClassNames] = useState<string[]>([]); // const on load in
  const [currFilteredStudents, setFilteredStudents] = useState<string[]>([]); // All students for currClass
  const [currStudentNames, setStudentNames] = useState<string[]>([]); // To get each student's grades
  const [currFilteredAssignments, setFilteredAssignments] = useState<number[]>([]); // currClass's assignments' weight
  const [isLoading, setIsLoading] = useState(true); //loading

  /**
   * This is JUST an example of how you might fetch some data(with a different API).
   * As you might notice, this does not show up in your console right now.
   * This is because the function isn't called by anything!
   *
   * You will need to lookup how to fetch data from an API using React.js
   * Something you might want to look at is the useEffect hook.
   *
   * The useEffect hook will be useful for populating the data in the dropdown box.
   * You will want to make sure that the effect is only called once at component mount.
   *
   * You will also need to explore the use of async/await.
   *
   */
  useEffect(() => {
    const fetchData = async () => {
        // Fetch the list of classes
        const classListResponse = await fetch(
          `${BASE_API_URL}/class/listBySemester/${SEMESTER}?buid=${MY_BU_ID}`,
          {
            method: "GET",
            headers: GET_DEFAULT_HEADERS(),
          }
        );
  
        const classListData = await classListResponse.json();
  
        // Pull out class Ids and class Names
        const classIds = classListData.map((item: IUniversityClass) => item.classId);
        const classNames = classListData.map((item: IUniversityClass) => item.title);

        setClassIds(classIds);
        setClassNames(classNames);
    };
  
    fetchData().then(()=> {setIsLoading(false)});
  }, []);

  useEffect(() => {
    if (currClassId !== "") {
      //console.log(currClassId, currClassName);
      const fetchStudents = async () => {
        const res = await fetch(`${BASE_API_URL}/class/listStudents/${currClassId}?buid=${MY_BU_ID}`, {
          method: "GET",
          headers: GET_DEFAULT_HEADERS()
        });
        const json = await res.json();
        setFilteredStudents(json); 
      };
  
      const fetchAssignments = async () => {
        const res = await fetch(`${BASE_API_URL}/class/listAssignments/${currClassId}?buid=${MY_BU_ID}`, {
          method: "GET",
          headers: GET_DEFAULT_HEADERS()
        });
        const json = await res.json();
        const filteredValues = json.map((item:IUniversityAssignments) => item.weight);
        setFilteredAssignments(filteredValues);
      };
  
      // Fetch students and assignments
      fetchStudents().then(()=> fetchAssignments());
    }
  }, [currClassId, currClassName]);
  
  useEffect(() => { // Since setFilteredAssignments happens after fetchStudents
                    // Runs when students avail
    //console.log("filtered students:", currFilteredStudents);
    if (currFilteredStudents.length > 0 && currFilteredAssignments.length > 0) {
      const fetchAndSetGrades = async () => {
        const grades = await calcAllGrades();
        setGrades(grades);
      };
  
      const fetchStudentNamesAndSetNames = async () => {
        const studentNames = await Promise.all(currFilteredStudents.map(fetchStudentNames));
        setStudentNames(studentNames);
      };
  
      // Fetch and set student names
      fetchStudentNamesAndSetNames().then(() => {
        // After setting student names, fetch and set grades
        fetchAndSetGrades();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currFilteredAssignments]);

  useEffect(() => { // Runs after new student grades are avail
    if (allGrades.length > 0) {
      // Update student data here
      const updatedStudentData = allGrades.map((grade, index) => {
        const studentId = currFilteredStudents[index];
        const studentName = currStudentNames[index];
        return createData(
          studentId,
          studentName,
          currClassId,
          currClassName,
          SEMESTER,
          grade
        );
      });

      setData(updatedStudentData);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allGrades]);


  const fetchStudentNames = async (student: string) => {
    const res = await fetch(`${BASE_API_URL}/student/GetById/${student}?buid=${MY_BU_ID}`, {
      method: "GET",
      headers: GET_DEFAULT_HEADERS()
    });
    const json = await res.json();
  
    const filteredData: string = json[0].name;
    return filteredData;
  }; 

  const fetchStudentGrades = async (student: string) => {
    const res = await fetch(`${BASE_API_URL}/student/listGrades/${student}/${currClassId}?buid=${MY_BU_ID}`, {
      method: "GET",
      headers: GET_DEFAULT_HEADERS()
    });
  
    const json = await res.json();
    const gradesObject = json.grades[0];
    // convert the strings into numbers, because for some reason grades are strings
    const gradeValues: number[] = Object.values(gradesObject).map(Number);
  
    return gradeValues
  };

  async function calcAllGrades() {
    const grades: number[] = [];
    const gradePromises = currFilteredStudents.map((student) => fetchStudentGrades(student));
    
    const gradeResults = await Promise.all(gradePromises);
    gradeResults.forEach((gradeValues) => {
      const grade = calcGrade(gradeValues, currFilteredAssignments);
      grades.push(grade);
    });
  
    //console.log("All grades calculated:", grades);
    return grades;
  }

  function calcGrade(grades: number[], weight: number[]) {
    const summing = grades.reduce((accumulator, currentValue, index) => {
      const product = currentValue * ~~(weight[index]/100); 
      //without ~~ grade can become nonterminating decimal
      return accumulator + product;
    }, 0);
    return summing;
  };

  function createData( // Creates data for Data Table
    studentId: string,
    studentName: string,
    classId: string,
    className: string,
    semester: string,
    finalGrade: number
  ) {
    return { studentId, studnetName: studentName, classId, className, semester, finalGrade };
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Grid container spacing={2} style={{ padding: "1rem" }}>
        <Grid xs={12} container alignItems="center" justifyContent="center">
          <Typography variant="h2" gutterBottom>
            Spark Assessment
          </Typography>
        </Grid>
        <Grid xs={12} md={4}>
          <Typography variant="h4" gutterBottom>
            Select a class
          </Typography>
          <div style={{ width: "100%" }}>
          <Select
            fullWidth={true}
            label="Class"
            value={currClassName}
            onChange={(event) => {
              const selectedClassName = event.target.value; // Get the selected class name
              const selectedIndex = allClassNames.indexOf(selectedClassName); // Find the index

              if (selectedIndex !== -1) {
                setIsLoading(true);
                setCurrClassId(allClassIds[selectedIndex]); // Update class Id and Name
                setCurrClassName(selectedClassName);
              }
            }}
          >
            {allClassNames.map((className, index) => (
              <MenuItem key={index} value={className}>
                {className}
              </MenuItem>
            ))}
          </Select>
          </div>
        </Grid>
        <Grid xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            Final Grades
          </Typography>
          {isLoading ? (<div>Loading data...</div>) : ("")} 
          {/* shows user when loading */}
          <GradeTable studentData={currData} />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
