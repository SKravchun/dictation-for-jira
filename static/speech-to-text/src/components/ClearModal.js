import React, {useCallback} from 'react';
import Modal, {ModalFooter, ModalHeader, ModalTitle, ModalTransition} from "@atlaskit/modal-dialog";
import Button from "@atlaskit/button";

const ClearModal = ({handleReset, setIsOpen, isOpen}) => {


  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
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

  );
};

export default ClearModal;
