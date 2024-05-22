// eslint-disable-next-line no-unused-vars
import { tab_extension } from 'libs';
import { forwardRef, useContext, useState, useEffect } from 'react';
import { Metrics } from 'components';
import { useTableauSession } from 'hooks';
import { useSession, signIn, signOut } from "next-auth/react";
import { getEmbed, tabSignOut } from "libs";
import { SecureDataContext } from 'components/SecureDataProvider';

// forwardRef HOC receives ref from parent and sets placeholder
export const TableauExtension = forwardRef(function TableauViz(props, ref) {
  const { src, height, width, device, hideTabs, toolbar, isPublic } = props;

  // size of parent div placeholder
  let containerHeight = height;
  let containerWidth = width;
  if (toolbar === 'hidden') {
    containerHeight = height;
  }
  const containerStyle = {
    height: containerHeight + 'px',
    width: containerWidth + 'px',
  };

  return (
    <div
      className='rounded'
      style={containerStyle}
    >
      {process.env.DEBUG === 'true' ?
        <div>
          TableauExtension
          <br></br>
          ----------------
        </div> : null}
      <AuthLayer
        src={src}
        ref={ref}
        height={height}
        width={width}
        device={device}
        hide-tabs={hideTabs ? true : false}
        toolbar={toolbar}
        isPublic={isPublic}
      />
      {process.env.DEBUG === 'true' ?
        <div>
          End TableauExtension
          <br></br>
          --------------------
        </div> : null}
    </div>
  )
});

// handles rendering logic during authentication
const AuthLayer = forwardRef(function AuthLayer(props, ref) {
  const { src, height, width, device, hideTabs, toolbar, isPublic } = props;

  const { secureData, updateSecureData } = useContext(SecureDataContext);
  const [userNameCtx, setUserNameCtx] = useState(secureData.userName);
  const [siteName, setSiteName] = useState(secureData.siteName);
  const [tableauUrl, setTableauUrl] = useState(secureData.tableauUrl);
  const [caClientId, setCaClientId] = useState(secureData.caClientId);
  const [caSecretId, setCaSecretId] = useState(secureData.caSecretId);
  const [caSecretValue, setCaSecretValue] = useState(secureData.caSecretValue);
  const [isReady, setIsReady] = useState(secureData.isReady);

  useEffect(() => {
    console.log(`NEW SESSION DATA!`)
    // console.debug(JSON.stringify(secureData));
    // Check if the current session username matches the provided username
    const usernameMismatch = userNameCtx && userNameCtx !== secureData.userName
      || tableauUrl !== secureData?.tableauUrl
      || siteName !== secureData?.siteName
      || caClientId !== secureData?.caClientId
      || caSecretId !== secureData?.caSecretId
      || caSecretValue !== secureData?.caSecretValue;
    console.log(`Username mismatch?? ${usernameMismatch ? 'true' : 'false'}`);
    // If there's a mismatch, force re-authentication
    if (usernameMismatch) {
      (async () => {
        console.log(`signing user out because secureData is mismatched`);
        await signOut({ redirect: false });
        await tabSignOut(tableauUrl);
        await signIn('demo-user', { redirect: false, ID: userNameCtx, ...secureData });
      })();
    }
    setUserNameCtx(secureData.userName);
    setSiteName(secureData.siteName);
    setTableauUrl(secureData.tableauUrl);
    setCaClientId(secureData.caClientId);
    setCaSecretId(secureData.caSecretId);
    setCaSecretValue(secureData.caSecretValue);
  }, [secureData.siteName, secureData.isReady, secureData.userName, secureData.tableauUrl, secureData.caClientId, secureData.caSecretId, secureData.caSecretValue, secureData, userNameCtx, siteName, tableauUrl, caClientId, caSecretId, caSecretValue]);


  // tanstack query hook to manage embed sessions
  const {
    status,
    data: jwt,
    error: sessionError,
    isSuccess: isSessionSuccess,
    isError: isSessionError,
    isLoading: isSessionLoading
  } = useTableauSession(secureData.userName, secureData, siteName);

  console.debug(`data: ${jwt}`);
  console.debug(`status: ${status}`)

  if (isSessionError) {
    console.debug(sessionError);
  }

  if (isSessionSuccess) {
    console.debug(`Session success!`);
  }

  return (
    <div className='rounded'>
      {process.env.DEBUG === 'true' ?
        <div>
          TableauExtension.jsx Authlayer
          <br></br>
          ------------------------------
          <br></br>
          {secureData.isReady === false ? 'not ready' : 'ready'} -- usernameCtx: {userNameCtx}
          <br></br>
          {JSON.stringify(secureData)}
          <br></br>
          jwt: {jwt}
          <br></br>
          isSessionError={isSessionError ? 'true' : 'false'}
          <br></br>
          isSessionLoading={isSessionLoading ? 'true' : 'false'}
          <br></br>
          isSessionSuccess={isSessionSuccess ? 'true' : 'false'}
        </div> : null}
      {isSessionError ? <p>Authentication Error!</p> : null}
      {isSessionLoading ? <p>Authenticating the User...</p> : null}
      {isSessionSuccess ?
        <Metrics />
        : null}
      {process.env.DEBUG === 'true' ?
        <div>
          <br></br>
          End TableauExtension.jsx Authlayer
          <br></br>
          ------------------------------
        </div> : null}
    </div>
  )
})
