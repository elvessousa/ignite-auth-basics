import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { parseCookies, destroyCookie } from 'nookies';
import { AuthTokenError } from '../services/errors/AuthTokenError';

export function withSSRAuth<P>(fn: GetServerSideProps<P>): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    if (!cookies['auth-basics.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    try {
      return await fn(ctx);
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(ctx, 'auth-basics.token');
        destroyCookie(ctx, 'auth-basics.refreshToken');

        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        };
      }

      return {
        props: {},
      };
    }
  };
}
