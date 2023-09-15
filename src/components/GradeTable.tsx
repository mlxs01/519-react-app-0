/**
 * You might find it useful to have some dummy data for your own testing.
 * Feel free to write this function if you find that feature desirable.
 * 
 * When you come to office hours for help, we will ask you if you have written
 * this function and tested your project using it.
 */
import React, { useState } from 'react';
import GradeTableProps from '../types/api_types';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';

export function dummyData() {
  return [];
}

const GradeTable: React.FC<GradeTableProps> = ({ studentData }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, studentData.length - page * rowsPerPage);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Student Id</TableCell>
            <TableCell>Student Name</TableCell>
            <TableCell>Class Id</TableCell>
            <TableCell>Class Name</TableCell>
            <TableCell>Semester</TableCell>
            <TableCell>Final Grade</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? studentData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : studentData
          ).map((std) => (
            <TableRow key={std.studentId}>
              <TableCell>{std.studentId}</TableCell>
              <TableCell>{std.studnetName}</TableCell>
              <TableCell>{std.classId}</TableCell>
              <TableCell>{std.className}</TableCell>
              <TableCell>{std.semester}</TableCell>
              <TableCell align="right">{std.finalGrade}</TableCell>
            </TableRow>
          ))}

          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={studentData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
};

export default GradeTable;

