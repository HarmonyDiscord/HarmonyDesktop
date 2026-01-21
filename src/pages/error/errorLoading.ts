export const ERROR_LOADING = /* html */ `
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
        .bold {
            font-weight: bold;
        }
        .logo {
            width: 140px;
            height: 140px;
        }
        p {
            margin: 0;
            color: #DFDFDF;
            margin-bottom: 2px;
            padding: 0;
            font-size: 14px;
            font-weight: normal;
        }
        button {
            margin: 5px;
            background-color: #FFFFFF10;
            color: #DFDFDF;
            border: none;
            padding: 11px 20px;
            font-weight: bold;
            width: 320px;
            color: white;
            font-size: 16px;
            cursor: pointer;
            border-radius: 4px;
        }
        button:hover {
            background-color: #FFFFFF20;
        }
    </style>
</head>
<body>
    <div>
        <p>The application could not be loaded.</p>
        <p class="bold">Please check your internet connection.</p>
        <p class="bold">If this error persists, try again in a few minutes.</p>
    </div>
    <button id="retry-button">Retry</button>
</body>
<script>
document.addEventListener('DOMContentLoaded', () => {
    const retryButton = document.getElementById('retry-button');

    retryButton.addEventListener('click', () => {
        window.api.reload();
    });
});
</script>
</html>
`;
