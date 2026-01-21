export const UPDATER = /* html */ `
<html>
<head>
    <style>
        body {
            background-color: #641436;
            color: #FFFFFF;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
            font-family: Arial, sans-serif;
            text-align: center;
        }
        h2 {
            font-size: 22px;
            margin-top: 10px;
        }
        p {
            font-weight: bold;
        }
        .progress-container {
            width: 80%;
            max-width: 400px;
            background-color: #FFFFFF20;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 10px;
        }
        .progress-bar {
            height: 8px;
            width: 0%;
            background-color: #FFFFFF;
            transition: width 0.2s ease-in-out;
        }
        .logo {
            width: 140px;
            height: 140px;
        }
    </style>
</head>
<body>
    <h2>Harmony Updater</h2>
    <div class="progress-container">
        <div class="progress-bar" id="progress-bar"></div>
    </div>
    <p id="status-text">Updating...</p>
    <script>
        window.api.onUpdateProgress((progress) => {
            const progressBar = document.getElementById("progress-bar");
            const statusText = document.getElementById("status-text");

            if (!isNaN(progress) && progress >= 0 && progress <= 100) {
                statusText.innerText = "Updating: " + Math.round(progress) + "%";
                progressBar.style.width = progress + "%";
            }
        });
    </script>
</body>
</html>
`;
