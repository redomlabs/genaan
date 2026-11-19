import StoreLayout from "./(store)/layout";
import StoreNotFound from "./(store)/not-found";

/** Unmatched URLs get the storefront chrome too. */
export default function NotFound() {
  return (
    <StoreLayout>
      <StoreNotFound />
    </StoreLayout>
  );
}
