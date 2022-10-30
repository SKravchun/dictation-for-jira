import React, {Fragment} from 'react';
import SpeechRecognition, {useSpeechRecognition} from 'react-speech-recognition';
import Button from '@atlaskit/button';
import './css/app.css'
import {useRef, useCallback, useState, useEffect} from "react";
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
import SuccessIcon from '@atlaskit/icon/glyph/check-circle';
import {G300} from '@atlaskit/theme/colors';
import {gridSize} from '@atlaskit/theme/constants';
import {token} from '@atlaskit/tokens';
import {AutoDismissFlag, FlagGroup} from '@atlaskit/flag';


function App() {

  const [isListening, setIsListening] = useState(false);
  const [area, setArea] = useState('');
  const [context, setContext] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const [flags, setFlags] = React.useState([]);

  let {
    transcript,
    finalTranscript,
    resetTranscript,
    listening,
  } = useSpeechRecognition()

  const textareaInput = useRef(null)


  const descriptionFlag = () => {
    const newFlagId = flags.length + 1;
    const newFlags = flags.slice();
    newFlags.splice(0, 0, newFlagId);

    setFlags(newFlags);
  };

  const commentFlag = () => {
    const newFlagId = flags.length + 1;
    const newFlags = flags.slice();
    newFlags.splice(0, 0, newFlagId);

    setFlags(newFlags);
  };

  const handleDismiss = () => {
    setFlags(flags.slice(1));
  };

  const select = () => {
    return window.getSelection().toString()
  }

  function changeSelectedText(text) {
    setArea(area.replace(select(), ` ${text} `))
  }

  useEffect(() => {
    if (select()) {
      if (area.toLowerCase().includes(select().toLowerCase())) {
        changeSelectedText(finalTranscript)
        resetTranscript()
      }
    } else if (finalTranscript) {
      insertText(finalTranscript)
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
    handleFocus()
  };

  const handleReset = () => {
    resetTranscript();
    setArea('')
  };

  function firstSymbol(str) {
    if (!str) return str;
    return str[0].toUpperCase() + str.slice(1);
  }


  function handleFocus() {
    textareaInput.current.focus()
  }

  // function cursorPosition(text){
  //   let start = textareaInput.current.selectionStart
  //   textareaInput.current.focus();
  //   let caretPos = start + text.length + 1;
  //   textareaInput.current.setSelectionRange(caretPos, caretPos);
  // }

  function insertText(text) {
    let val = textareaInput.current.value;
    let start = textareaInput.current.selectionStart, end = textareaInput.current.selectionEnd;
    const inserted = ` ${firstSymbol(text)}. `
    setArea(textareaInput.current.value = val?.slice(0, start) + inserted + val?.slice(end))
    textareaInput.current.focus();
    let caretPos = start + inserted.length;
    textareaInput.current.setSelectionRange(caretPos, caretPos);

  }

  async function getIssue(issueKey) {
    const issueResponse = await requestJira(`/rest/api/3/issue/${issueKey}`);
    const response = await issueResponse.json()
    return response?.fields?.description?.content
  }

  async function setDescription(text, issueKey) {

    const description = await getIssue(issueKey)
    const fields = {}

    fields.description = {
      "type": "doc",
      "version": 1,
      "content": []
    }

    if (text) {
      if (text && !description) {
        fields?.description?.content.push({
          "type": "paragraph",
          "content": [
            {
              "text": text.trim(),
              "type": "text"
            }
          ]
        })
      } else if (text && description) {
        description.forEach((arr) => {
          fields?.description?.content?.push(arr)
        })
        fields?.description?.content.push({
          "type": "paragraph",
          "content": [
            {
              "text": text.trim(),
              "type": "text"
            }
          ]
        })
      }


      const response = await requestJira(`/rest/api/3/issue/${issueKey}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({fields})
        }
      );
      descriptionFlag()

    }

  }

  async function createComment(text, issueKey) {

    if (text) {
      const fields = {
        "body": {
          "type": "doc",
          "version": 1,
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "text": text.trim(),
                  "type": "text"
                }
              ]
            }
          ]
        }
      }

      const response = await requestJira(`/rest/api/3/issue/${issueKey}/comment`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fields)
        }
      );
      commentFlag()
    }

  }

  return (
    <Fragment>
      <div className="buttonWrapper">
        <div className="btnContainer">

          <Tooltip content={listening ? 'Stop dictation' : 'Click to start dictate'}>
            {(tooltipProps) => (
              <div
                {...tooltipProps}
                className="recordBtn"
                style={{
                  backgroundColor: listening ? '#e41a1a' : '',
                  color: listening ? 'white' : '',
                }}
                onClick={handleListing}>
                <VidAudioOnIcon className="micro" label=""/>
              </div>
            )}
          </Tooltip>

          <Button isDisabled={!area} onClick={openModal}>Clear</Button>

          <Tooltip content="Text below will be appended to description">
            {(tooltipProps) => (
              <Button isDisabled={!area} {...tooltipProps} onClick={() => setDescription(area, context)}>
                Append to Description
              </Button>
            )}
          </Tooltip>

          <Tooltip content="A comment will be created from the text below">
            {(tooltipProps) => (
              <Button isDisabled={!area} {...tooltipProps} onClick={() => createComment(area, context)}>
                Create comment
              </Button>
            )}
          </Tooltip>
        </div>

        <Tooltip content="Help">
          {(tooltipProps) => (
            <div {...tooltipProps} className="btnContainer">
              <div onClick={() => {
                router.open('https://saasjet.atlassian.net/wiki/spaces/SAASJET/pages/2448523294/Dictation+for+Jira');
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
        ref={textareaInput}
        onChange={(e) => setArea(e.target.value)}
      />

      <ModalTransition>
        {isOpen && (
          <Modal isBlanketHidden="false" width="small">
            <ModalHeader>
              <ModalTitle>Clear text?</ModalTitle>
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

      <FlagGroup onDismissed={handleDismiss}>
        {flags.map((flagId) => {
          return (
            <AutoDismissFlag
              id={flagId}
              icon={
                <SuccessIcon
                  primaryColor={token('color.icon.success', G300)}
                  label="Success"
                  size="medium"
                />
              }
              key={flagId}
              title={`#${flagId} Description updated`}
              description="Refresh the page to see the changes."
            />
          );
        })}
      </FlagGroup>

      <FlagGroup onDismissed={handleDismiss}>
        {flags.map((flagId) => {
          return (
            <AutoDismissFlag
              id={flagId}
              icon={
                <SuccessIcon
                  primaryColor={token('color.icon.success', G300)}
                  label="Success"
                  size="medium"
                />
              }
              key={flagId}
              title={`#${flagId} Comment created`}
              description="Refresh the page to see the changes."
            />
          );
        })}
      </FlagGroup>

    </Fragment>
  );
}

export default App;
