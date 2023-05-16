import React from 'react';
import './ExcelPreview.scss';

interface ExcelPreviewProps {
    data: string[][];
    modifiedCells: Record<string, string>;
}

const ExcelPreview: React.FC<ExcelPreviewProps> = ({ data, modifiedCells }) => {
    return (
        <div className="excel-preview">
            <table className="excel-preview__table">
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={`row-${rowIndex}`}>
                            {row.map((cell, cellIndex) => {
                                const cellId = `${rowIndex}-${cellIndex}`;
                                const isModified = Object.prototype.hasOwnProperty.call(modifiedCells, cellId);
                                return (
                                    <td 
                                        key={`cell-${cellIndex}`} 
                                        className={isModified ? 'modified' : ''}
                                        title={isModified ? `Valor original: ${modifiedCells[cellId]}` : ''}
                                    >
                                        {cell}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExcelPreview;
