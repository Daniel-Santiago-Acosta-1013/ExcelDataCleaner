import React from 'react';
import './ExcelPreview.scss';

interface ExcelPreviewProps {
    data: string[][];
    modifiedCells: Record<string, string>;
    originalCells: Record<string, string>;
    darkMode: boolean;  // Agrega esto
}

const ExcelPreview: React.FC<ExcelPreviewProps> = ({ data, modifiedCells, originalCells, darkMode }) => {
    return (
        <div className={`excel-preview ${darkMode ? 'dark-mode' : ''}`}>
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
                                        title={isModified ? `Valor original: ${originalCells[cellId]}` : ''}
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