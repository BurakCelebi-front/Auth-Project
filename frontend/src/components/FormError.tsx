interface FormErrorProps {
	message: string | null;
}

const FormError = ({ message }: FormErrorProps) =>
	message ? (
		<p className='text-red-500 font-semibold mb-4 text-sm' role='alert'>
			{message}
		</p>
	) : null;

export default FormError;
