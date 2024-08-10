const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Asegurarse de que la constante 'app' esté definida
const app = express();

// Configuración de multer para manejar archivos subidos
const upload = multer({ dest: 'uploads/' });

// Middleware para servir archivos estáticos
app.use(express.static('public'));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para manejar la carga del archivo .xlsx
app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Inicializar totales
        let totalEnrolledSum = 0;
        let totalTeenEnrolledSum = 0;

        // Preparar datos para el gráfico de Total Enrolled by Location
        const totalEnrolledByLocation = {};
        data.forEach(row => {
            const location = row['Location'];
            const enrolled = row['Enrolled'] || 0;
            totalEnrolledByLocation[location] = (totalEnrolledByLocation[location] || 0) + enrolled;
            totalEnrolledSum += enrolled;
        });

        // Preparar datos para el gráfico de 30CLS (Teens) Enrolled vs Seats Open por locación
        const teenEnrolledByLocation = {};
        const seatsOpenByLocation = {};
        data.forEach(row => {
            if (row['CR Type'] === '30CLS') {
                const location = row['Location'];
                const enrolled = row['Enrolled'] || 0;
                const seatsOpen = row['Seats Open'] || 0;

                if (!teenEnrolledByLocation[location]) {
                    teenEnrolledByLocation[location] = 0;
                }
                if (!seatsOpenByLocation[location]) {
                    seatsOpenByLocation[location] = 0;
                }

                teenEnrolledByLocation[location] += enrolled;
                seatsOpenByLocation[location] += seatsOpen;
                totalTeenEnrolledSum += enrolled;
            }
        });

        // Enviar los datos al frontend, incluyendo los totales
        res.json({
            totalEnrolledByLocation,
            totalEnrolledSum,
            teenEnrolledByLocation,
            seatsOpenByLocation,
            totalTeenEnrolledSum,
        });

        // Eliminar el archivo subido
        fs.unlinkSync(file.path);
    } catch (error) {
        console.error("Error processing the file:", error);
        res.status(500).json({ error: "Error processing the file" });
    }
});

// Configurar el puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor iniciado en http://localhost:${PORT}`));






