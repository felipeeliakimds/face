let recognition;
document.getElementById('microphone-btn').addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            document.getElementById('status').textContent = 'Microfone ativado com sucesso!';
            console.log('Microfone ativado:', stream);
        })
        .catch((error) => {
            document.getElementById('status').textContent = 'Permissão para o microfone foi negada.';
            console.error('Erro ao ativar microfone:', error);
        });
});

document.getElementById('listen-btn').addEventListener('click', () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
        alert('Seu navegador não suporta a API de reconhecimento de voz.');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        document.getElementById('status').textContent = 'Ouvindo...';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const messageElem = document.createElement('div');
        messageElem.classList.add('message', 'received');
        messageElem.textContent = transcript;
        const chatBox = document.querySelector('.chat-box');
        chatBox.appendChild(messageElem);
        chatBox.scrollTop = chatBox.scrollHeight;

        fetch('/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: transcript })
        })
        .then(response => response.json())
        .then(data => {
            const botMessageElem = document.createElement('div');
            botMessageElem.classList.add('message', 'received');
            botMessageElem.textContent = data.response;
            chatBox.appendChild(botMessageElem);
            chatBox.scrollTop = chatBox.scrollHeight;
        })
        .catch(error => {
            console.error('Erro ao enviar mensagem:', error);
        });

        document.getElementById('status').textContent = 'Ouvir finalizado.';
    };

    recognition.onerror = (event) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        document.getElementById('status').textContent = 'Erro ao ouvir. Tente novamente.';
    };

    recognition.onend = () => {
        if (document.getElementById('status').textContent === 'Ouvindo...') {
            document.getElementById('status').textContent = 'Ouvir finalizado.';
        }
    };

    recognition.start();
});
