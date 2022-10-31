import React from 'react';
import {AutoDismissFlag, FlagGroup} from "@atlaskit/flag";
import SuccessIcon from "@atlaskit/icon/glyph/check-circle";
import {token} from "@atlaskit/tokens";
import {G300} from "@atlaskit/theme/colors";

const Flag = ({setFlags, flags, action}) => {

  const handleDismiss = () => {
    setFlags(flags.slice(1));
  };
  return (
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
            title={`${action}`}
            description="Refresh the page to see the changes."
          />
        );
      })}
    </FlagGroup>

  );
};

export default Flag;
