import React, { ChangeEvent, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import ReactLoading from 'react-loading';
import './ExcelReader.scss';

const ExcelReader: React.FC = () => {

    const [data, setData] = useState<BlobPart | null>(null);
    const [loading, setLoading] = useState(false);
    const [specialChars, setSpecialChars] = useState<string>("");

    const escapeRegExp = (str: string) => {
        let result = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  // escape special characters
        result = result.replace(/-/g, '');  // remove dashes
        result += '-';  // add a single dash at the end
        return result;
    }

    const removeSpecialCharacters = (str: string) => {
        const accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ';
        const accentsOut = "AAAAAAaaaaaaOOOOOOooooooEEEEeeeeCcIIIIiiiiUUUUuuuuyNn";
        str = str.split('').map((letter) => {
            const accentIndex = accents.indexOf(letter);
            return accentIndex !== -1 ? accentsOut[accentIndex] : letter;
        }).join('');

        const escapedSpecialChars = escapeRegExp(specialChars);
        const specialCharsRegex = new RegExp(`[${escapedSpecialChars}]`, 'g');
        return str.replace(specialCharsRegex, "")
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
            const blob = new Blob([data], { type: "application/octet-stream" });
            saveAs(blob, "processed_file.xlsx");
        }
    };

    const retry = () => {
        window.location.reload();
    }

    return (
        <div className="excel-reader">
            <input type="text" value={specialChars} onChange={(e) => setSpecialChars(e.target.value)} placeholder="Ingrese caracteres especiales para remover" className="excel-reader__input" />
            <input type="file" accept=".xlsx, .xls" onChange={handleFile} className="excel-reader__input" />
            <button onClick={downloadFile} disabled={!data} className="excel-reader__button">Descargar</button>
            <button onClick={retry} className="excel-reader__button">Reintentar</button>
            {loading && <ReactLoading type={"bubbles"} color={"#blue"} height={'20%'} width={'20%'} />}
        </div>
    );
};

export default ExcelReader;