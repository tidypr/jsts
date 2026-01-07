import PhaseForm from '@/features/PhaseForm';

export default function PhaseFormpage() {
  return (
    <>
      <PhaseForm userId={session.user.id} />
    </>
  );
}
