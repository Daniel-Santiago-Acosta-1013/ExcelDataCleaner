import React, { ChangeEvent, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import ReactLoading from 'react-loading';
import ExcelPreview from '../ExcelPreview/ExcelPreview';
import './ExcelReader.scss';

const ExcelReader: React.FC = () => {

    const [data, setData] = useState<string[][] | null>(null);
    const [loading, setLoading] = useState(false);
    const [specialChars, setSpecialChars] = useState<string>("");
    const [darkMode, setDarkMode] = useState(false);
    const [modifiedCells, setModifiedCells] = useState<Record<string, string>>({});
    const [originalCells, setOriginalCells] = useState<Record<string, string>>({});

    const escapeRegExp = (str: string) => {
        let result = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  // escape special characters
        result = result.replace(/-/g, '');  // remove dashes
        result += '-';  // add a single dash at the end
        return result;
    }

    const removeSpecialCharacters = (str: any, cellId: string) => {
        if (typeof str !== 'string') {
            return str;
        }

        const originalStr = str;  // Store the original string

        const accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ';
        const accentsOut = "AAAAAAaaaaaaOOOOOOooooooEEEEeeeeCcIIIIiiiiUUUUuuuuyNn";
        let hasAccent = false;
        str = str.split('').map((letter) => {
            const accentIndex = accents.indexOf(letter);
            if (accentIndex !== -1) {
                hasAccent = true;
                return accentsOut[accentIndex];
            } else {
                return letter;
            }
        }).join('');

        const escapedSpecialChars = escapeRegExp(specialChars);
        const specialCharsRegex = new RegExp(`[${escapedSpecialChars}]`, 'g');

        const newStr = str.replace(specialCharsRegex, "");
        if (str !== newStr || hasAccent) {
            setModifiedCells(prev => ({ ...prev, [cellId]: str }));
            setOriginalCells(prev => ({ ...prev, [cellId]: originalStr }));
        }

        return newStr;
    }

    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        setLoading(true);
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

                    // Convert worksheet to JSON
                    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

                    // Process the data
                    const newData = json.map((row, rowIndex) =>
                        row.map((cell, cellIndex) =>
                            removeSpecialCharacters(cell, `${rowIndex}-${cellIndex}`)
                        )
                    );

                    setData(newData);
                    setLoading(false);
                    Swal.fire('Éxito', 'Archivo procesado correctamente', 'success');
                } catch (error) {
                    setLoading(false);
                    console.error("Hubo un error al procesar el archivo:", error);
                    Swal.fire('Error', 'Hubo un error al procesar el archivo', 'error');
                }
            };
            reader.onerror = (error) => {
                setLoading(false);
                console.error("Hubo un error al leer el archivo:", error);
                Swal.fire('Error', 'Hubo un error al leer el archivo', 'error');
            }
            reader.readAsArrayBuffer(file);
        } else {
            setLoading(false);
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
            const ws = XLSX.utils.aoa_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
            const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

            saveAs(blob, "processed_file.xlsx");
        }
    };

    const retry = () => {
        window.location.reload();
    }

    return (
        <div className={`excel-reader ${darkMode ? 'dark-mode' : ''}`}>
            <div className="excel-reader__top-bar">
                <button onClick={() => setDarkMode(!darkMode)} className="excel-reader__mode-toggle">Dark Mode</button>
            </div>
            <div className="excel-reader__content">
                <input type="text" value={specialChars} onChange={(e) => setSpecialChars(e.target.value)} placeholder="Ingrese caracteres especiales para remover" className="excel-reader__input" />
                <input type="file" accept=".xlsx, .xls" onChange={handleFile} className="excel-reader__input" />
                <div className="excel-reader__buttons">
                    <button onClick={downloadFile} disabled={!data} className="excel-reader__button">Descargar</button>
                    <button onClick={retry} className="excel-reader__button">Reintentar</button>
                </div>
                {loading && <ReactLoading type={"bubbles"} color={"#blue"} height={'20%'} width={'20%'} />}
                {data && <ExcelPreview data={data} modifiedCells={modifiedCells} originalCells={originalCells} />}
            </div>
        </div>
    );
};

export default ExcelReader;