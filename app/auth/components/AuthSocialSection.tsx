import {
  authOAuthDividerTextClass,
  authSocialButtonClass,
  authSocialRowWrapperClass,
} from "@/lib/auth-ui";

type Props = {
  googleAuthHref?: string;
};

export default function AuthSocialSection({ googleAuthHref }: Props) {
  return (
    <>
      <p className={authOAuthDividerTextClass}>Hoặc tiếp tục với</p>
      <div className={authSocialRowWrapperClass}>
        {googleAuthHref ? (
          <a
            href={googleAuthHref}
            className={`${authSocialButtonClass} inline-flex items-center justify-center no-underline`}
          >
            Đăng nhập với Google
          </a>
        ) : (
          <button
            type="button"
            className={authSocialButtonClass}
            disabled
            title=""
          >
            Đăng nhập với Google
          </button>
        )}
      </div>
    </>
  );
}
