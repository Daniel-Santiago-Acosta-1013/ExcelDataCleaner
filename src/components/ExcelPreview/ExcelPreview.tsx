import React from 'react';
import './ExcelPreview.scss';

interface ExcelPreviewProps {
  data: string[][];
}

const ExcelPreview: React.FC<ExcelPreviewProps> = ({ data }) => {
  return (
    <div className="excel-preview">
      <table className="excel-preview__table">
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`cell-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExcelPreview;