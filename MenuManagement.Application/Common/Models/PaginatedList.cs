using System;
using System.Collections.Generic;

namespace MenuManagement.Application.Common.Models
{
    public class PaginatedList<T>
    {
        public List<T> Data { get; set; } = new List<T>();
        public int PageIndex { get; set; }
        public int TotalPages { get; set; }
        public int TotalCount { get; set; }

        public bool HasPreviousPage => PageIndex > 1;
        public bool HasNextPage => PageIndex < TotalPages;

        public PaginatedList(List<T> data, int count, int pageIndex, int pageSize)
        {
            PageIndex = pageIndex;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);
            TotalCount = count;
            Data = data;
        }

        public PaginatedList() { }
    }
}
