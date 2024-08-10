document.getElementById('uploadForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Datos recibidos del servidor:", result);

            // Gráfico de barras: Total Enrolled by Location
            const ctx1 = document.getElementById('locationChart').getContext('2d');
            new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: Object.keys(result.totalEnrolledByLocation),
                    datasets: [{
                        label: 'Total Enrolled by Location',
                        data: Object.values(result.totalEnrolledByLocation),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // Mostrar el total debajo del gráfico de Total Enrolled by Location
            document.getElementById('totalEnrolledSum').textContent = `Total Enrolled: ${result.totalEnrolledSum || 0}`;

            // Gráfico de barras apiladas: 30CLS (Teens) Enrolled vs Seats Open por locación
            const ctx2 = document.getElementById('teenChart').getContext('2d');
            new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: Object.keys(result.teenEnrolledByLocation),
                    datasets: [
                        {
                            label: 'Enrolled',
                            data: Object.values(result.teenEnrolledByLocation),
                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Seats Open',
                            data: Object.values(result.seatsOpenByLocation),
                            backgroundColor: 'rgba(255, 159, 64, 0.6)',
                            borderColor: 'rgba(255, 159, 64, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                        }
                    }
                }
            });

            // Mostrar el total debajo del gráfico de 30CLS (Teens) Enrolled vs Seats Open by Location
            document.getElementById('totalTeenEnrolledSum').textContent = `Total 30CLS (Teens) Enrolled: ${result.totalTeenEnrolledSum || 0}`;

            // Mostrar el modal de éxito
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
        } else {
            console.error('Error al cargar el archivo:', response.statusText);
        }
    } catch (error) {
        console.error("Error submitting the form:", error);
    }
});




