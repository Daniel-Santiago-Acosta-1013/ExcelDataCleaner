import React, { ChangeEvent, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './ExcelReader.scss';

const ExcelReader: React.FC = () => {

    const [data, setData] = useState<BlobPart | null>(null);

    const removeSpecialCharacters = (str: string) => {
        return str.replace(/[^a-zA-Z0-9 ]/g, "");
    }

    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array((e.target?.result as ArrayBuffer));
                    const workbook = XLSX.read(data, { type: 'array' });

                    const worksheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[worksheetName];

                    for (const cell in worksheet) {
                        if (Object.prototype.hasOwnProperty.call(worksheet, cell)) {
                            if (cell[0] !== '!' && typeof worksheet[cell].v === 'string') {
                                worksheet[cell].v = removeSpecialCharacters(worksheet[cell].v);
                            }
                        }
                    }

                    const newWorkbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(newWorkbook, worksheet, worksheetName);

                    const newData = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'binary' });
                    setData(s2ab(newData));
                } catch (error) {
                    console.error("Hubo un error al procesar el archivo:", error);
                }
            };
            reader.onerror = (error) => {
                console.error("Hubo un error al leer el archivo:", error);
            }
            reader.readAsArrayBuffer(file);
        }
    };

    const s2ab = (s: string) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    };

    const downloadFile = () => {
        if (data) {
            const blob = new Blob([data], { type: "application/octet-stream" });
            saveAs(blob, "processed_file.xlsx");
        }
    };

    return (
        <div className="excel-reader">
            <input type="file" accept=".xlsx, .xls" onChange={handleFile} className="excel-reader__input" />
            <button onClick={downloadFile} disabled={!data} className="excel-reader__button">Descargar</button>
        </div>
    );
};

export default ExcelReader;
