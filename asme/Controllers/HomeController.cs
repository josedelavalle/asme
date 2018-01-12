using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace asme.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "Jose DeLavalle - ASME";

            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "ASME Interview App";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "ASME Interview App";

            return View();
        }
    }
}
