import * as xlsx from "xlsx";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function extractEmailsFromFile(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) return resolve([]);

                // Read file as array buffer
                const workbook = xlsx.read(data, { type: "array" });

                // Get the first sheet
                const firstSheetName = workbook.SheetNames[0];
                if (!firstSheetName) return resolve([]);
                const worksheet = workbook.Sheets[firstSheetName];
                if (!worksheet) return resolve([]);

                // Convert sheet to an array of arrays
                const rows = xlsx.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
                if (rows.length === 0) return resolve([]);

                const emails = new Set<string>();

                for (const row of rows) {
                    if (Array.isArray(row)) {
                        for (const cell of row) {
                            if (typeof cell === "string") {
                                const trimmed = cell.trim().toLowerCase();
                                if (EMAIL_REGEX.test(trimmed)) {
                                    emails.add(trimmed);
                                }
                            }
                        }
                    }
                }

                resolve(Array.from(emails));
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => {
            reject(err);
        };

        // Read binary data effectively to support both csv and xlsx natively
        reader.readAsArrayBuffer(file);
    });
}
