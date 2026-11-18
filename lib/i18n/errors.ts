import type { Locale } from "./locale";

const PERSIAN: Record<string, string> = {
  "That did not work. Try again.": "انجام این کار ممکن نشد. دوباره تلاش کن.",
  "Log in first to edit your profile.": "برای ویرایش پروفایل اول وارد حسابت شو.",
  "Log in first to post feedback.": "برای ثبت فیدبک اول وارد حسابت شو.",
  "Log in first to vote.": "برای رای دادن اول وارد حسابت شو.",
  "Log in first to write a comment.": "برای نوشتن کامنت اول وارد حسابت شو.",
  "Log in first to vote on comments.": "برای رای دادن به کامنت اول وارد حسابت شو.",
  "Log in first to delete a comment.": "برای حذف کامنت اول وارد حسابت شو.",
  "Log in first to delete feedback.": "برای حذف فیدبک اول وارد حسابت شو.",
  "Log in first.": "اول وارد حسابت شو.",
  "Admin access is required.": "دسترسی مدیر لازم است.",

  "That feedback id is not valid.": "شناسه فیدبک معتبر نیست.",
  "Comments need at least 2 characters.": "کامنت باید حداقل ۲ نویسه باشد.",
  "Comments can be up to 2000 characters.": "کامنت حداکثر ۲۰۰۰ نویسه است.",
  "This feedback does not take comments.": "این فیدبک کامنت نمی‌پذیرد.",
  "The comment you are replying to was not found.": "کامنتی که به آن پاسخ می‌دهی پیدا نشد.",
  "You can only reply to a top level comment.": "فقط می‌شود به کامنت اصلی پاسخ داد.",
  "The comment could not be saved.": "کامنت ذخیره نشد.",
  "That comment id is not valid.": "شناسه کامنت معتبر نیست.",
  "That comment was not found.": "این کامنت پیدا نشد.",
  "You can only delete your own comment.": "فقط کامنت خودت را می‌توانی حذف کنی.",
  "This comment has replies, so it cannot be deleted.": "این کامنت پاسخ دارد و حذف نمی‌شود.",
  "That vote is not valid.": "این رأی معتبر نیست.",
  "This comment is not open for voting.": "رأی دادن به این کامنت بسته شده.",

  "Title must be at least 3 characters.": "عنوان باید حداقل ۳ نویسه باشد.",
  "Title must be 140 characters or fewer.": "عنوان حداکثر ۱۴۰ نویسه است.",
  "Details must be at least 10 characters.": "توضیح باید حداقل ۱۰ نویسه باشد.",
  "Details are too long.": "توضیح بیش از حد بلند است.",
  "Feedback type must be bug, praise or improvement.": "نوع فیدبک باید باگ، تعریف یا پیشنهاد باشد.",
  "Add a product or company name.": "یک محصول یا نام شرکت اضافه کن.",
  "Could not save your feedback.": "فیدبک ذخیره نشد.",
  "That feedback could not be found.": "این فیدبک پیدا نشد.",
  "This feedback is not open for voting.": "رأی دادن به این فیدبک بسته شده.",
  "That status is not valid.": "این وضعیت معتبر نیست.",
  "Feedback not found.": "فیدبک پیدا نشد.",
  "We could not find that post, or it is not yours.": "این پست پیدا نشد یا مال تو نیست.",
  "That request could not be found.": "این درخواست پیدا نشد.",
  "The reply is too long.": "پاسخ بیش از حد بلند است.",
  "Support request not found.": "درخواست پشتیبانی پیدا نشد.",
  "Could not publish the update.": "انتشار تغییر انجام نشد.",

  "Send the profile fields.": "فیلدهای پروفایل را بفرست.",
  "Enter your name, at least two characters.": "نامت را وارد کن، حداقل دو نویسه.",
  "That name is too long.": "این نام بیش از حد بلند است.",
  "Age must be a number between 5 and 120.": "سن باید عددی بین ۵ و ۱۲۰ باشد.",
  "Pick one of the gender options.": "یکی از گزینه‌های جنسیت را انتخاب کن.",
  "That company name is too long.": "نام شرکت بیش از حد بلند است.",
  "The bio can be up to 280 characters.": "معرفی حداکثر ۲۸۰ نویسه است.",
  "That profile photo is not valid.": "عکس پروفایل معتبر نیست.",
  "That request is not valid.": "این درخواست معتبر نیست.",

  "Enter a valid email.": "ایمیل معتبر وارد کن.",
  "Enter a valid phone number.": "شماره موبایل معتبر وارد کن.",
  "An email or a phone number is required.": "ایمیل یا شماره موبایل لازم است.",
  "Could not create the user.": "کاربر ساخته نشد.",
  "User not found.": "کاربر پیدا نشد.",
  "Could not update the user.": "کاربر به‌روز نشد.",
  "Could not restore the user.": "کاربر بازگردانی نشد.",

  "Admin sign-in is not enabled. Set ADMIN_PASSWORD in the environment.":
    "ورود مدیر فعال نیست. ADMIN_PASSWORD را در محیط تنظیم کن.",
  "Too many attempts. Try again in a few minutes.": "تلاش‌های زیاد. چند دقیقه دیگر دوباره تلاش کن.",
  "Invalid request.": "درخواست معتبر نیست.",
  "Wrong password.": "رمز عبور اشتباه است.",
  "Sign in to the admin panel first.": "اول وارد پنل مدیریت شو.",
  "Nothing to restore.": "چیزی برای بازگردانی نیست.",
};

export function localizeError(message: string, locale: Locale): string {
  if (locale !== "fa") return message;
  return PERSIAN[message] ?? message;
}
