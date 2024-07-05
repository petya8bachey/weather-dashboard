import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTable } from 'react-table';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const DataTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    const result = await axios.get('http://localhost:5000/api/weather');
    setData(result.data);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "WeatherData");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'WeatherData.xlsx');
  };

  const columns = React.useMemo(
    () => [
      { Header: 'City', accessor: 'city' },
      { Header: 'Temperature', accessor: 'temperature' },
      { Header: 'Pressure', accessor: 'pressure' },
      { Header: 'Humidity', accessor: 'humidity' }
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns, data });

  return (
    <div>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <button onClick={handleExport}>Export to Excel</button>
    </div>
  );
};

export default DataTable;
