using System;

namespace MenuManagement.Domain
{
    public class OperationResult<T>
    {
        public bool Succeeded { get; set; }
        public T? ResultData { get; set; }
        public string[] Errors { get; set; } = Array.Empty<string>();

        public static OperationResult<T> Success(T data) => new OperationResult<T> { Succeeded = true, ResultData = data };
        public static OperationResult<T> Failure(params string[] errors) => new OperationResult<T> { Succeeded = false, Errors = errors };
    }

    public class OperationResult
    {
        public bool Succeeded { get; set; }
        public string[] Errors { get; set; } = Array.Empty<string>();

        public static OperationResult Success() => new OperationResult { Succeeded = true };
        public static OperationResult Failure(params string[] errors) => new OperationResult { Succeeded = false, Errors = errors };
    }
}
