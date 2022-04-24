import './App.css';
import React, {useEffect, useState} from "react";
import axios from "axios";
import useSpeechSynthesisMain from "./useSpeechSenthesisMain";
import useSpeechRecognition from "./useRecognitionMain";


const onEnd = () => {
    // You could do something here after speaking has finished
};
const onEnd2 = () => {
    // You could do something here after listening has finished
};

function App() {

    const {speak, cancel, speaking, supported, voices} = new useSpeechSynthesisMain({
        onEnd,
    });
    const [blocked, setBlocked] = useState(false);
    const [text, setText] = useState('');
    const [languages, setLanguages] = useState([{languageText: 'Русский', language: 'ru'}, {
        languageText: 'Белорусский',
        language: 'be'
    }])
    const [responseMessage, setResponseData] = useState('')

    useEffect(() => {
        sendTextToTranslate()
    }, [text])
    const ln = languages[0].language === 'ru' ? 'ru-RU' : 'be-BY'
    const voice = voices[ln] || null;

    const sendTextToTranslate = () => {

        axios.post('http://localhost:8080/language',
            '',
            {headers: {"Access-Control-Allow-Origin": "*"}})
            .then(function (response) {
            })
            .catch(function (error) {
                console.log(error);
            });


        axios.post('http://localhost:8080/translate',
            {translateLanguageOptions: `${languages[0].language}-${languages[1].language}`, sourceText: text},
            {headers: {"Access-Control-Allow-Origin": "*"}})
            .then(function (response) {
                setResponseData(response.data)
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    const onResult = (result) => {
        setText(result);
    };

    const onError = (event) => {
        if (event.error === 'not-allowed') {
            setBlocked(true);
        }
    };

    const {listen, listening, stop, supported2} = useSpeechRecognition({
        onResult,
        onEnd2,
        onError,
    });



    const toggle = listening
        ? stop
        : () => {
            setBlocked(false);
            listen({lang: ln});
        };

    return (
        <div className="App">

            <div className={'text-areas-block'}>
                <div style={{width: '500px'}}>
                    <div style={{fontSize: '32px'}}>{languages[0].languageText}</div>
                    <textarea value={text} onChange={(e) => setText(e.target.value)}
                              placeholder={'Ввежите или продиктуйте текст для перевода'}
                              className={'TextArea'}/>

                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '99%'}}>

                        {listening ?
                            <button className={'microphone-btn-close'} disabled={blocked} type="button" onClick={toggle}/>
                            : <button className={'microphone-btn'} disabled={blocked} type="button" onClick={toggle}/>
                        }

                        {speaking ? (
                            <button className={'mic-stop'} type="button" onClick={cancel}/>

                        ) : (
                            <button className={'mic-start'}
                                    type="button"
                                    onClick={() => speak({text, voice, rate: 1, pitch: 1})}
                            />
                        )}


                        {blocked && (
                            <p style={{color: 'red'}}>
                                The microphone is blocked for this site in your browser.
                            </p>
                        )}
                        <button className={'clear-btn'}
                                type="button"
                                onClick={() => setText('')}
                        />
                    </div>

                </div>

                <button onClick={() => setLanguages([languages[1], languages[0]])} className={'arrow-btn'}/>
                <div style={{width: '500px'}}>
                    <div style={{fontSize: '32px'}}>{languages[1].languageText}</div>
                    <textarea value={text === '' ? '' : responseMessage}
                              className={'TextArea'}/>


                    {speaking ? (
                        <button className={'mic-start-second'} type="button" onClick={cancel}/>

                    ) : (
                        <button className={'mic-start-second'}
                                type="button"
                                onClick={() => {
                                    const utterance = new window.SpeechSynthesisUtterance();
                                    utterance.text = responseMessage;
                                    utterance.voice = voice;
                                    utterance.onend = onEnd();
                                    utterance.rate = 1;
                                    utterance.pitch = 1;
                                    utterance.volume = 1;
                                    utterance.lang = 'ru-RU'
                                    window.speechSynthesis.speak(utterance);
                                }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
