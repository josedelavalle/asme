using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace asme.Models
{
    public class Event
    {
        public string id { get; set; }
        public string Date { get; set; }
        public string Name { get; set; }
        public string Link { get; set; }
        public string Location { get; set; }
        public List<decimal> Coordinates { get; set; }
    }

    public class ProductViewModel
    {
        public int ItemsCount { get; set; }
        public List<Product> ProductList { get; set; }
    }

    public class Product
    {
        public string Name { get; set; }
        public string ProductDescription { get; set; }
        public string NavigateUrl { get; set; }
        public List<string> AvailableFormats { get; set; }
        public string CategoryName { get; set; }
        public string ProductLanguage { get; set; }
        public string CurrencySymbol { get; set; }
        public string ListPrice { get; set; }
        public string ISBN { get; set; }
        public string NumberOfPages { get; set; }
        public int ProductYear { get; set; }
        public int QuantitySold { get; set; }
    }

    public class Topic
    {
        public string BigHeader { get; set; }
        public string Copy { get; set; }
        public string Date { get; set; }
        public int DocumentId { get; set; }
        public string Image { get; set; }
        public string LinkCalloutText { get; set; }
        public string LinkCalloutUrl { get; set; }
        public string LinkReadMoreText { get; set; }
        public string LinkReadMoreUrl { get; set; }
    }
}