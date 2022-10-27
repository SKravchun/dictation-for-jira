import React, {Fragment} from 'react';
import SpeechRecognition, {useSpeechRecognition} from 'react-speech-recognition';
import Button from '@atlaskit/button';
import './css/app.css'
import {useCallback, useState, useEffect} from "react";
import {requestJira, view, router} from '@forge/bridge';
import TextArea from '@atlaskit/textarea';
import VidAudioOnIcon from '@atlaskit/icon/glyph/vid-audio-on'
import Tooltip from '@atlaskit/tooltip';
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from '@atlaskit/modal-dialog';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle'

function App() {

  const [isListening, setIsListening] = useState(false);
  const [area, setArea] = useState('');
  const [context, setContext] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  let {
    transcript,
    finalTranscript,
    resetTranscript,
    listening,
  } = useSpeechRecognition()

  useEffect(() => {
    if (finalTranscript) {
      const space = ' '
      const dot = '.'
      setArea(area + space + firstSymbol(finalTranscript) + dot)
      resetTranscript()
    }
  }, [finalTranscript])
  useEffect(() => {

    view.getContext().then(data => setContext(data.extension.issue.key));
  }, []);



  const handleListing = () => {
    if (listening) {
      setIsListening(false);
      SpeechRecognition.stopListening();
    } else {
      setIsListening(true);
      SpeechRecognition.startListening({
        continuous: true,
      });
    }
  };

  const handleReset = () => {
    resetTranscript();
    setArea('')
  };

  function firstSymbol(str) {
    if (!str) return str;
    return str[0].toUpperCase() + str.slice(1);
  }

  async function getIssue(issueKey) {
    const issueResponse = await requestJira(`/rest/api/2/issue/${issueKey}`);
    const response = await issueResponse.json()
    return response.fields.description
  }

  async function setLanguage(text, issueKey) {

    const description = await getIssue(issueKey)

    if(text){
      const fields = {
        description: {
          "type": "doc",
          "version": 1,
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "text": description ? description + "\n" + text.trim() : text.trim(),
                  "type": "text"
                }
              ]
            }
          ]
        }
      }

      const issueResponse = await requestJira(`/rest/api/3/issue/${issueKey}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({fields})
        }
      );
    }
  }

  return (
    <Fragment>
      <div className="buttonWrapper">
        <div className="btnContainer">
          <div
            className="recordBtn"
            style={{
              backgroundColor: listening ? '#e41a1a' : '',
              color: listening ? 'white' : '',

            }}
            onClick={() => {
              handleListing()
            }}>
            <VidAudioOnIcon className="micro" label=""/>
          </div>

          <Button onClick={openModal}>Clear</Button>

          <Tooltip content="Text below will be appended to description">
            {(tooltipProps) => (
              <Button {...tooltipProps} onClick={() => setLanguage(area, context)}>
                Append to description
              </Button>
            )}
          </Tooltip>
        </div>

        <Tooltip content="Help">
          {(tooltipProps) => (
            <div {...tooltipProps} className="btnContainer">
              <div onClick={() => {
                router.open('https://atlaskit.atlassian.com/');
              }} className="helpBtn">
                <QuestionCircleIcon label=""/>
              </div>
            </div>
          )}
        </Tooltip>

      </div>
      <TextArea
        appearance="standard"
        placeholder="Enter your text here using keyboard or microphone"
        value={area}
        onChange={(e) => setArea(e.target.value)}
      />

      <ModalTransition>
        {isOpen && (
          <Modal isBlanketHidden = "false" width="small">
            <ModalHeader>
              <ModalTitle>Clear textarea?</ModalTitle>
            </ModalHeader>
            <ModalFooter>
              <Button appearance="subtle" onClick={closeModal}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={() => {
                handleReset()
                closeModal()
              }} autoFocus>
                OK
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>

    </Fragment>
  );
}

export default App;
