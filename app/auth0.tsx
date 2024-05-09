"use client";

import { Auth0Provider } from "@auth0/auth0-react";

export default function Auth0({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Auth0Provider
      domain="motiong.us.auth0.com"
      clientId="UCPBMzUz9SNbJUtOg0dD4iFgzhfqGiA6"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      {children}
    </Auth0Provider>
  );
}
